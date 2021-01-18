import { merge } from "lodash";
import type { OutputOptions } from "rollup";
import type { Options } from "rollup-plugin-terser";
import type { Mutable } from "type-fest";
import type { RoleteContext, RoleteContextData } from "../context";
import { RoletePlugin } from "../plugins";
import type { BuildVariables } from "../variables";

export class TerserPlugin extends RoletePlugin {
    private options!: Options;
    private forceEnabled!: boolean;

    enabled(_data: RoleteContextData, variables: BuildVariables): boolean {
        return variables.configuration === "prod" || this.forceEnabled;
    }

    prepare(roll: Mutable<RoleteContext>): void {
        this.reset();
        roll.tenser = options => {
            this.options = merge(this.options, options);
            this.forceEnabled = true;
        };
    }

    async output(): Promise<OutputOptions> {
        const { terser } = await import("rollup-plugin-terser");

        return { plugins: [terser(this.options)] };
    }

    private reset(): void {
        this.options = {};
        this.forceEnabled = false;
    }
}

declare module "../context" {
    export interface RoleteContext {
        readonly tenser: (options: Options) => void;
    }
}
