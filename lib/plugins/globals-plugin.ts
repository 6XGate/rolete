import { isEmpty, isObject } from "lodash";
import type { InputOptions, OutputOptions } from "rollup";
import type { Mutable } from "type-fest";
import type { RoleteContext, RoleteContextData } from "../core/context";
import { RoletePlugin } from "../core/plugins";

export type SimpleGlobals = { [library: string]: string };

export function makeExternals(globals: SimpleGlobals): string[] {
    return Object.keys(globals);
}

export class GlobalsPlugin extends RoletePlugin {
    private globals!: SimpleGlobals;

    enabled(): boolean {
        return !isEmpty(this.globals);
    }

    prepare(roll: Mutable<RoleteContext>, data: RoleteContextData): void {
        if (data.variables.packageJson.rolete && isObject(data.variables.packageJson.rolete.globals)) {
            this.globals = { ...data.variables.packageJson.rolete.globals };
        } else {
            this.globals = { };
        }

        roll.globals = globals => {
            this.globals = Object.assign(this.globals, globals);
        };
    }

    async input(data: RoleteContextData): Promise<InputOptions> {
        // Since the merge strategy does not allow external to be merged, we assign it.
        data.input.external = makeExternals(this.globals);

        // Since assignment was used, don't return anything to merge.
        return Promise.resolve({ });
    }

    async output(data: RoleteContextData): Promise<OutputOptions> {
        if (data.output.format === "umd" || data.output.format === "iife") {
            // Since the merge strategy does not allow globals to be merged, we assign it.
            data.output.globals = { ...this.globals };
        }

        // Since assignment was used, don't return anything to merge.
        return Promise.resolve({ });
    }
}

declare module "../utils/package" {
    export interface RoletePackageConfig {
        globals?: SimpleGlobals;
    }
}

declare module "../core/context" {
    export interface RoleteContext {
        readonly globals: (globals: SimpleGlobals) => void;
    }
}
