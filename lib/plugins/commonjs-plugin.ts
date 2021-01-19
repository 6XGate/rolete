import type { RollupCommonJSOptions } from "@rollup/plugin-commonjs";
import { merge } from "lodash";
import type { InputOptions } from "rollup";
import type { Mutable } from "type-fest";
import type { RoleteContext } from "../core/context";
import { RoletePlugin } from "../core/plugins";
import { NodeResolvePlugin } from "./node-resolve-plugin";

export class CommonjsPlugin extends RoletePlugin {
    options!: RollupCommonJSOptions;

    // eslint-disable-next-line class-methods-use-this
    enabled(): boolean {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    after(): typeof RoletePlugin[] {
        return [NodeResolvePlugin];
    }

    prepare(roll: Mutable<RoleteContext>): void {
        this.options = {};
        roll.commonJs = options => {
            this.options = merge(this.options, options);
        };
    }

    async input(): Promise<InputOptions> {
        const { default: commonjs } = await import("@rollup/plugin-commonjs");

        return { plugins: [commonjs(this.options)] };
    }
}

declare module "../core/context" {
    export interface RoleteContext {
        readonly commonJs: (options: RollupCommonJSOptions) => void;
    }
}
