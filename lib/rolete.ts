/* eslint-disable no-await-in-loop */
import { bold } from "colorette";
import { isEmpty } from "lodash";
import type { ReadonlyDeep } from "type-fest";
import type { Arguments } from "./cli/arguments";
import { getArguments } from "./cli/arguments";
import type { RoleteContext, RoleteContextData } from "./core/context";
import { makeDefaultContextData } from "./core/context";
import { merge } from "./core/merge/merge";
import { inputStrategies, outputStrategies } from "./core/merge/strategies";
import type { RoletePlugin } from "./core/plugins";
import { getPlugins, registerPlugin } from "./core/plugins";
import { Target } from "./core/values";
import { makeBuildVariables } from "./core/variables";
import type { BuildVariables } from "./core/variables";
import { defaultPlugins } from "./plugins/builtin-plugins";
import * as logger from "./utils/logger";
import type { PackageConfiguration } from "./utils/package";
import { readPackageConfig } from "./utils/package";
import { dedent } from "./utils/tags";

export type { RoleteContext, RoleteContextData } from "./core/context";
export type { BuildVariables } from "./core/variables";
export { Configuration, Target } from "./core/values";
export { RoletePlugin } from "./core/plugins";
export { AliasPlugin } from "./plugins/alias-plugin";
export { AutoInstallPlugin } from "./plugins/auto-install-plugin";
export { BabelPlugin } from "./plugins/babel-plugin";
export { CommonjsPlugin } from "./plugins/commonjs-plugin";
export { GlobalsPlugin } from "./plugins/globals-plugin";
export { InputPlugin } from "./plugins/input-plugin";
export { NodeResolvePlugin } from "./plugins/node-resolve-plugin";
export { OutputPlugin } from "./plugins/output-plugin";
export { TerserPlugin } from "./plugins/terser-plugin";
export { TypeScriptPlugin } from "./plugins/type-script-plugin";

export type BuildConfiguration = (variables: ReadonlyDeep<BuildVariables>, roll: RoleteContext) => void;

interface Rolete {
    (config: BuildConfiguration): Promise<RoleteContextData[]>;
    extend: (plugin: typeof RoletePlugin) => void;
}

/** Register the default plug-ins. */
defaultPlugins.forEach(plugin => { registerPlugin(plugin) });

function getTargets(pkgConfig: PackageConfiguration, args: Arguments): readonly Target[] {
    // If targets are given on the command-line, they limit or extend the list to build.
    if (args.target && !isEmpty(args.target)) {
        return args.target;
    }

    if (!isEmpty(pkgConfig.outputs)) {
        return Object.keys(pkgConfig.outputs) as Target[];
    }

    return Target;
}

const rolete: Rolete = async (config: BuildConfiguration): Promise<RoleteContextData[]> => {
    const args = getArguments();
    const pkgConfig = await readPackageConfig();
    const plugins = getPlugins();
    const results: RoleteContextData[] = [];
    const targets = getTargets(pkgConfig, args);
    for (const target of targets) {
        const variables = makeBuildVariables(target, pkgConfig);
        const data = makeDefaultContextData(pkgConfig, variables);
        const context = { } as RoleteContext;

        // Prepare the context with plug-in.
        for (const plugin of plugins) {
            plugin.prepare(context, data);
        }

        config(variables, context);

        for (const plugin of plugins) {
            if (plugin.enabled(data)) {
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

                data.input = merge(inputStrategies, data.input, await plugin.input(data));
                data.output = merge(outputStrategies, data.output, await plugin.output(data));
            }
        }

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
        } else if (args.target && args.target.includes(target)) {
            logger.warn(
                dedent`
                Target "${bold(target)}" specified, but no output provided
                    - Set "file" or "dir" with "output()" for target "${bold(target)}"`,
            );
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
