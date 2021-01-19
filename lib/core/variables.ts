import type { Properties } from "../cli/arguments";
import { getArguments } from "../cli/arguments";
import type { PackageConfiguration, PackageJsonRolete } from "../utils/package";
import type { Configuration, Target } from "./values";

export type BuildVariables = {
    configuration: Configuration;
    target: Target;
    packageJson: PackageJsonRolete;
    env: typeof process.env;
    properties: Properties;
    name: string;
    inPath?: string;
    outPath?: string;
};

type GetTypedEntries = <T extends { [P in keyof T]: unknown }>(target: T) => [ keyof T, T[keyof T] ][];
const objEntries = Object.entries as GetTypedEntries;

const clone = {
    pkgJson(pkgJson: PackageJsonRolete): PackageJsonRolete {
        return this.object(pkgJson);
    },
    array<T extends unknown[]>(source: T): T {
        return source.map(value => this.value(value)) as T;
    },
    object<T extends { [P in keyof T]: unknown }>(source: T): T {
        const result = { } as T;
        for (const [ key, value ] of objEntries(source)) {
            result[key] = this.value(value);
        }

        return result;
    },
    value<T>(source: T): T {
        if (Array.isArray(source)) {
            return this.array(source);
        } else if (typeof source === "object") {
            return this.object(source);
        }

        return source;
    },
};

export function makeBuildVariables(target: Target, config: PackageConfiguration): BuildVariables {
    const args = getArguments();
    const configuration = args.configuration || "dev" as const;

    return {
        configuration,
        target,
        packageJson: clone.pkgJson(config.packageJson),
        env:         { ...process.env },
        properties:  { ...args.property, configuration, target },
        name:        config.name,
        inPath:      config.input,
        outPath:     config.outputs[target],
    };
}
