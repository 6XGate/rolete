import type { InputOptions, OutputOptions } from "rollup";
import type { PackageConfiguration } from "../utils/package";
import type { BuildVariables } from "./variables";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RoleteContext {
    // Empty, will be extended by plug-ins.
}

export interface RoleteContextData {
    variables: BuildVariables;
    input: InputOptions;
    output: OutputOptions;
}

export function makeDefaultContextData(pkgConfig: PackageConfiguration, variables: BuildVariables): RoleteContextData {
    return {
        variables,
        input: {
            input: pkgConfig.input,
        },
        output: {
            name:      pkgConfig.name,
            file:      variables.outPath,
            sourcemap: true,
            format:    variables.target,
        },
    };
}
