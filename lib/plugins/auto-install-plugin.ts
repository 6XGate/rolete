import type { RollupAutoInstallOptions } from "@rollup/plugin-auto-install";
import { merge } from "lodash";
import type { InputOptions } from "rollup";
import type { Mutable } from "type-fest";
import type { RoleteContext } from "../context";
import { RoletePlugin } from "../plugins";
import { NodeResolvePlugin } from "./node-resolve-plugin";

export class AutoInstallPlugin extends RoletePlugin {
    isEnabled!: boolean;
    options!: RollupAutoInstallOptions;

    enabled(): boolean {
        return this.isEnabled;
    }

    // eslint-disable-next-line class-methods-use-this
    before(): typeof RoletePlugin[] {
        return [NodeResolvePlugin];
    }

    prepare(roll: Mutable<RoleteContext>): void {
        this.reset();
        roll.autoInstall = options => {
            this.isEnabled = true;
            this.options = merge(this.options, options);
        };
    }

    // eslint-disable-next-line class-methods-use-this
    dependencies(): string[] {
        return ["@rollup/plugin-auto-install"];
    }

    async input(): Promise<InputOptions> {
        const { default: auto } = await import("@rollup/plugin-auto-install");

        return { plugins: [auto(this.options)] };
    }

    private reset(): void {
        this.isEnabled = false;
        this.options = {};
    }
}

declare module "../context" {
    export interface RoleteContext {
        readonly autoInstall: (options: RollupAutoInstallOptions) => void;
    }
}
