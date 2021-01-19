import type { OutputOptions } from "rollup";
import type { Mutable } from "type-fest";
import type { RoleteContext, RoleteContextData } from "../core/context";
import { merge } from "../core/merge/merge";
import { outputStrategies } from "../core/merge/strategies";
import { RoletePlugin } from "../core/plugins";

export class OutputPlugin extends RoletePlugin {
    // eslint-disable-next-line class-methods-use-this
    enabled(): boolean {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    prepare(roll: Mutable<RoleteContext>, data: RoleteContextData): void {
        roll.output = (output: OutputOptions) => {
            merge(outputStrategies, data.output, output);
            if (output.dir) {
                delete data.output.file;
            }
        };
    }
}

declare module "../core/context" {
    export interface RoleteContext {
        readonly output: (output: OutputOptions) => void;
    }
}
