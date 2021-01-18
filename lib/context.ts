import type { InputOptions, OutputOptions } from "rollup";
import { merge } from "./merge/merge";
import { inputStrategies, outputStrategies } from "./merge/strategies";
import type { BuildVariables } from "./variables";

export type SimpleGlobals = { [library: string]: string };

export interface RoleteContextBase {
    readonly globals: (globals: SimpleGlobals) => void;
    readonly input: (input: InputOptions) => void;
    readonly output: (output: OutputOptions) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RoleteContext extends RoleteContextBase {
    // Empty for extension.
}

export interface RoleteContextData {
    variables: BuildVariables;
    input: InputOptions;
    output: OutputOptions;
    globals: SimpleGlobals;
}

export function makeDefaultContextData(variables: BuildVariables): RoleteContextData {
    return {
        variables,
        input: {
            input: variables.inPath,
        },
        output: {
            name:      variables.name,
            file:      variables.outPath,
            sourcemap: true,
            format:    variables.target,
        },
        globals: { },
    };
}

export function makeContext(data: RoleteContextData): RoleteContextBase {
    return {
        globals: globals => {
            data.globals = { ...data.globals, ...globals };
        },
        input: input => {
            merge(inputStrategies, data.input, input);
        },
        output: output => {
            merge(outputStrategies, data.output, output);
            if (output.dir) {
                delete data.output.file;
            }
        },
    };
}

export function makeExternals(globals: SimpleGlobals): string[] {
    return Object.keys(globals);
}
