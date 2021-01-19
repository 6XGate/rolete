import { merge } from "lodash";
import type { OutputOptions } from "rollup";
import type { Options } from "rollup-plugin-terser";
import type { Mutable } from "type-fest";
import type { RoleteContext, RoleteContextData } from "../core/context";
import { RoletePlugin } from "../core/plugins";

export class TerserPlugin extends RoletePlugin {
    private options!: Options;
    private forceEnabled!: boolean;

    enabled(data: RoleteContextData): boolean {
        return data.variables.configuration === "prod" || this.forceEnabled;
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

declare module "../core/context" {
    export interface RoleteContext {
        readonly tenser: (options: Options) => void;
    }
}
