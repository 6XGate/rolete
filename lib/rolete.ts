/* eslint-disable no-await-in-loop */
import { isEmpty } from "lodash";
import type { ReadonlyDeep } from "type-fest";
import { getArguments } from "./cli/arguments";
import type { RoleteContext, RoleteContextData } from "./context";
import { makeContext, makeDefaultContextData, makeExternals } from "./context";
import { merge } from "./merge/merge";
import { inputStrategies, outputStrategies } from "./merge/strategies";
import type { RoletePlugin } from "./plugins";
import { getPlugins, registerPlugin } from "./plugins";
import { defaultPlugins } from "./plugins/builtin-plugins";
import { dedent } from "./utils/dedent";
import { readPackageConfig } from "./utils/package";
import { Target } from "./variables";
import type { BuildVariables, Configuration } from "./variables";

export type { BuildVariables, Configuration, Target } from "./variables";
export type { RoleteContext, RoleteContextData } from "./context";

export type BuildConfiguration = (variables: ReadonlyDeep<BuildVariables>, roll: RoleteContext) => void;

interface Rolete {
    (config: BuildConfiguration): Promise<RoleteContextData[]>;
    extend: (plugin: typeof RoletePlugin) => void;
}

/** Register the default plug-ins. */
defaultPlugins.forEach(plugin => { registerPlugin(plugin) });

const rolete: Rolete = async (config: BuildConfiguration): Promise<RoleteContextData[]> => {
    const pkgConfig = await readPackageConfig();
    const args = getArguments();

    // Determine the proper configuration.
    const configuration = (args.c || args.p?.CONFIGURATION || "dev") as Configuration;

    // Properties, with defaults.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const props = { ...args.p, CONFIGURATION: configuration };

    const plugins = getPlugins();
    const results: RoleteContextData[] = [];
    const targets = !isEmpty(pkgConfig.outputs) ? Object.keys(pkgConfig.outputs) as Target[] : Target;
    for (const target of targets) {
        const outPath = pkgConfig.outputs[target];
        const variables: ReadonlyDeep<BuildVariables> = Object.freeze({
            configuration,
            target,
            env:        process.env,
            properties: props,
            name:       pkgConfig.name,
            inPath:     pkgConfig.input,
            outPath,
            typings:    pkgConfig.typings,
        });

        const data = makeDefaultContextData(variables);
        const context = makeContext(data) as RoleteContext;
        for (const plugin of plugins) {
            plugin.prepare(context, variables);
        }

        config(variables, context);

        for (const plugin of plugins) {
            if (plugin.enabled(data, variables)) {
                const missing = [] as string[];
                for (const dependency of plugin.dependencies()) {
                    if (!(dependency in pkgConfig.dependencies)) {
                        missing.push(dependency);
                    }
                }

                if (missing.length > 0) {
                    throw new Error(`Missing dependencies ${
                        missing.join(", ")
                    }, run "npm install --save-dev ${
                        missing.join(" ")
                    }"`);
                }

                data.globals = { ...data.globals, ...(await plugin.globals()) };
                data.input = merge(inputStrategies, data.input, await plugin.input());
                data.output = merge(outputStrategies, data.output, await plugin.output());
            }
        }

        if (data.output.format === "umd" || data.output.format === "iife") {
            data.output.globals = { ...data.globals };
        }

        data.input.external = makeExternals(data.globals);

        if (data.output.file || data.output.dir) {
            if (!data.input.input) {
                throw new Error(
                    dedent`
                    No input file specified for target "${target}", output "${data.output.file || data.output.dir}";
                        - Specified it "package.json"
                        - Set "input" for "input()"`,
                );
            }

            results.push(data);
        }
    }

    if (results.length === 0) {
        throw new Error(
            dedent`
            No targets specified;
                - Specified them in "package.json"
                - Set "file" or "dir" with "output()" for a target`,
        );
    }

    return results;
};

rolete.extend = plugin => { registerPlugin(plugin) };

export default rolete;
