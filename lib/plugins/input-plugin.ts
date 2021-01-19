import type { InputOptions } from "rollup";
import type { Mutable } from "type-fest";
import type { RoleteContext, RoleteContextData } from "../core/context";
import { merge } from "../core/merge/merge";
import { inputStrategies } from "../core/merge/strategies";
import { RoletePlugin } from "../core/plugins";

export class InputPlugin extends RoletePlugin {
    // eslint-disable-next-line class-methods-use-this
    enabled(): boolean {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    prepare(roll: Mutable<RoleteContext>, data: RoleteContextData): void {
        roll.input = (input: InputOptions) => {
            merge(inputStrategies, data.input, input);
        };
    }
}

declare module "../core/context" {
    export interface RoleteContext {
        readonly input: (input: InputOptions) => void;
    }
}
