import type { InputOptions, OutputOptions } from "rollup";

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
    input: InputOptions;
    output: OutputOptions;
    globals: SimpleGlobals;
}

export function makeExternals(globals: SimpleGlobals): string[] {
    return Object.keys(globals);
}
