import sysPath from "path";
import { isArray, isEmpty, isNil, isObject, isString } from "lodash";
import prettyBytes from "pretty-bytes";
import prettyMilliseconds from "pretty-ms";
import type { InputOption, RollupBuild } from "rollup";
import { rollup } from "rollup";
import packageInfo from "../../package.json";
import type { RoleteContextData } from "../context";
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

async function build(rootPath: string, bundle: RollupBuild, data: RoleteContextData): Promise<void> {
    const { output: chunks } = await bundle.write(data.output);
    const outDir = data.output.file ? sysPath.dirname(data.output.file) : data.output.dir || "";

    for (const chunk of chunks) {
        if (chunk.type === "asset") {
            const inputs = normalizeInputs(data.input.input).map(input => sysPath.relative(rootPath, input));
            const output = sysPath.relative(rootPath, sysPath.join(outDir, chunk.fileName));

            logger.log(`(${inputs.join(", ")}) -> (${output}): ${prettyBytes(chunk.source.length)}`);
        } else {
            const inputs = normalizeInputs(data.input.input).map(input => sysPath.relative(rootPath, input));
            const output = sysPath.relative(rootPath, sysPath.join(outDir, chunk.fileName));

            logger.log(`(${inputs.join(", ")}) -> (${output}) ${prettyBytes(chunk.code.length)}`);
        }
    }

    // closes the bundle
    await bundle.close();
}

async function main(): Promise<void> {
    logger.line(`${packageInfo.name} ${packageInfo.version}: ${packageInfo.description}`);

    // Get the arguments now in case help is requested.
    getArguments();

    const startedAt = Date.now();
    const rootPath = sysPath.dirname(await findPackageDotJson());
    const configurations = await getOptions(rootPath);
    await Promise.all(configurations.map(async config => {
        if (isNil(config.output) || isEmpty(config.output)) {
            throw new Error("Missing output configuration");
        }

        try {
            const bundle = await rollup({ ...config.input, output: config.output });
            await build(rootPath, bundle, config);
        } catch (error: unknown) {
            logger.failure(error);
        }
    }));

    const runTime = Date.now() - startedAt;

    logger.info(prettyMilliseconds(runTime));
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
