import type { RollupNodeResolveOptions } from "@rollup/plugin-node-resolve";
import { merge } from "lodash";
import type { InputOptions } from "rollup";
import type { Mutable } from "type-fest";
import type { RoleteContext } from "../context";
import { RoletePlugin } from "../plugins";
import { CommonjsPlugin } from "./commonjs-plugin";

export class NodeResolvePlugin extends RoletePlugin {
    options!: RollupNodeResolveOptions;

    // eslint-disable-next-line class-methods-use-this
    enabled(): boolean {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    before(): typeof RoletePlugin[] {
        return [CommonjsPlugin];
    }

    prepare(roll: Mutable<RoleteContext>): void {
        this.options = {};
        roll.resolve = options => {
            this.options = merge(this.options, options);
        };
    }

    async input(): Promise<InputOptions> {
        const { default: resolve } = await import("@rollup/plugin-node-resolve");

        return { plugins: [resolve(this.options)] };
    }
}

declare module "../context" {
    export interface RoleteContext {
        readonly resolve: (options: RollupNodeResolveOptions) => void;
    }
}
