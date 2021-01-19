import sysPath from "path";
import { bold, italic } from "colorette";
import { isArray, isEmpty, isNil, isObject, isString } from "lodash";
import prettyBytes from "pretty-bytes";
import prettyMilliseconds from "pretty-ms";
import type { InputOption, RollupBuild } from "rollup";
import { rollup } from "rollup";
import packageInfo from "../../package.json";
import type { RoleteContextData } from "../core/context";
import type { Target } from "../core/values";
import * as logger from "../utils/logger";
import { findPackageDotJson } from "../utils/package";
import { getArguments } from "./arguments";

interface SystemError extends Error {
    code: string;
}

function isSystemError(error: unknown): error is SystemError {
    return error instanceof Error && "name" in error;
}

async function getOptions(rootPath: string): Promise<RoleteContextData[]> {
    const configPath = sysPath.join(rootPath, "rolete.config");
    try {
        const { default: config } = await import(configPath) as { default: Promise<RoleteContextData[]> };

        return config;
    } catch (error: unknown) {
        if (isSystemError(error) && error.code === "MODULE_NOT_FOUND") {
            const { default: rolete } = await import("../rolete");

            return rolete(() => undefined);
        }

        throw error;
    }
}

function normalizeInputs(inputs?: InputOption): string[] {
    if (isString(inputs)) {
        return [inputs];
    } else if (isArray(inputs)) {
        return inputs;
    } else if (isObject(inputs)) {
        return Object.values(inputs);
    }

    return [];
}

function logOutput(inputs: string[], output: string, bytes: number, target: Target): void {
    logger.log(`Target ${bold(target)}, ${inputs.join(", ")} -> ${output}, ${italic(prettyBytes(bytes))}`);
}

async function build(rootPath: string, bundle: RollupBuild, data: RoleteContextData): Promise<void> {
    const { output: chunks } = await bundle.write(data.output);
    const outDir = data.output.file ? sysPath.dirname(data.output.file) : data.output.dir || "";

    for (const chunk of chunks) {
        if (chunk.type === "asset") {
            const inputs = normalizeInputs(data.input.input).map(input => sysPath.relative(rootPath, input));
            const output = sysPath.relative(rootPath, sysPath.join(outDir, chunk.fileName));

            logOutput(inputs, output, chunk.source.length, data.variables.target);
        } else {
            const inputs = normalizeInputs(data.input.input).map(input => sysPath.relative(rootPath, input));
            const output = sysPath.relative(rootPath, sysPath.join(outDir, chunk.fileName));

            logOutput(inputs, output, chunk.code.length, data.variables.target);
        }
    }

    // closes the bundle
    await bundle.close();
}

async function main(): Promise<void> {
    // Get the arguments now in case help is requested.
    const args = getArguments();

    // Echo the logo line.
    if (!args.logo) {
        logger.write("log", `${packageInfo.name} ${packageInfo.version}: ${packageInfo.description}`);
    }

    const startedAt = Date.now();
    const rootPath = sysPath.dirname(await findPackageDotJson());
    const configurations = await getOptions(rootPath);
    await Promise.all(configurations.map(async data => {
        if (isNil(data.output) || isEmpty(data.output)) {
            throw new Error("Missing output configuration");
        }

        try {
            const bundle = await rollup({ ...data.input, output: data.output });
            await build(rootPath, bundle, data);
        } catch (error: unknown) {
            logger.failure(error);
        }
    }));

    const runTime = Date.now() - startedAt;

    logger.info(`Built in ${prettyMilliseconds(runTime)}`);
}

export function runtimeMain(): void {
    main().
        then(() => {
            process.exit(logger.failed() ? 1 : 0);
        }).
        catch(error => {
            logger.exception(error);

            process.exit(1);
        });
}
