import type { RollupAliasOptions } from "@rollup/plugin-alias";
import { merge, omit } from "lodash";
import type { InputOptions } from "rollup";
import type { Mutable } from "type-fest";
import type { RoleteContext } from "../core/context";
import { RoletePlugin } from "../core/plugins";

type AliasEntries = Required<RollupAliasOptions>["entries"];

export class AliasPlugin extends RoletePlugin {
    private options!: Omit<RollupAliasOptions, "entries">;
    private entries!: null | AliasEntries;
    private isEnabled!: boolean;

    enabled(): boolean {
        return this.isEnabled;
    }

    prepare(roll: Mutable<RoleteContext>): void {
        this.reset();
        roll.alias = (entries, options) => {
            this.options = merge(this.options, omit(options, "entries"));
            this.entries = entries;
            this.isEnabled = true;
        };
    }

    // eslint-disable-next-line class-methods-use-this
    dependencies(): string[] {
        return ["@rollup/plugin-alias"];
    }

    async input(): Promise<InputOptions> {
        const options = this.entries ? { ...this.options, entries: this.entries } : this.options;
        const { default: alias } = await import("@rollup/plugin-alias");

        return { plugins: [alias(options)] };
    }

    private reset(): void {
        this.options = {};
        this.entries = null;
        this.isEnabled = false;
    }
}

declare module "../core/context" {
    export interface RoleteContext {
        readonly alias: (entries: AliasEntries, options?: Omit<RollupAliasOptions, "entries">) => void;
    }
}
