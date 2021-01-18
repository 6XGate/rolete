import type { RollupBabelInputPluginOptions, RollupBabelOutputPluginOptions } from "@rollup/plugin-babel";
import { isArray, isObject, isString, merge } from "lodash";
import type { InputOptions, OutputOptions } from "rollup";
import type { Mutable } from "type-fest";
import type { RoleteContext, RoleteContextData } from "../context";
import { RoletePlugin } from "../plugins";
import type { BuildVariables } from "../variables";

export class BabelPlugin extends RoletePlugin {
    private options!: RollupBabelInputPluginOptions|RollupBabelOutputPluginOptions;
    private onOutput!: boolean;

    enabled(data: RoleteContextData): boolean {
        if (this.onOutput) {
            return true;
        }

        if (data.input.input) {
            if (isString(data.input.input)) {
                return (/\.jsx?$/u).test(data.input.input);
            }

            if (isArray(data.input.input)) {
                for (const input of data.input.input) {
                    if ((/\.jsx?$/u).test(input)) {
                        return true;
                    }
                }

                return false;
            }

            if (isObject(data.input.input)) {
                for (const path of Object.values(data.input.input)) {
                    if ((/\.jsx?$/u).test(path)) {
                        return true;
                    }
                }

                return false;
            }
        }

        return false;
    }

    prepare(roll: Mutable<RoleteContext>, variables: BuildVariables): void {
        this.reset(variables);
        roll.babel = (options, onOutput) => {
            this.options = merge(this.options, options);
            this.onOutput = Boolean(onOutput);
        };
    }

    // eslint-disable-next-line class-methods-use-this
    dependencies(): string[] {
        return [ "@rollup/plugin-babel", "@babel/core", "@babel/preset-env", "@babel/plugin-transform-runtime" ];
    }

    async input(): Promise<InputOptions> {
        const { getBabelInputPlugin } = await import("@rollup/plugin-babel");

        return this.onOutput ? {} : { plugins: [getBabelInputPlugin(this.options)] };
    }

    async output(): Promise<OutputOptions> {
        const { getBabelOutputPlugin } = await import("@rollup/plugin-babel");

        return this.onOutput ? { plugins: [getBabelOutputPlugin(this.options)] } : {};
    }

    private reset(variables: BuildVariables): void {
        this.options = ([ "cjs", "esm" ]).includes(variables.target) ?
            {
                presets: ["@babel/preset-env"],
                plugins: [[ "@babel/plugin-transform-runtime", { useESModules: variables.target === "esm" } ]],
            } : {
                presets: ["@babel/preset-env"],
            };

        this.onOutput = false;
    }
}

declare module "../context" {
    export interface RoleteContext {
        readonly babel: (options: RollupBabelInputPluginOptions|RollupBabelOutputPluginOptions, onOutput?: boolean) => void;
    }
}
