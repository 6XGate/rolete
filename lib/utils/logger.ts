import { options, blue, gray, green, red, yellow } from "colorette";
import { isError } from "lodash";
import type { RollupError } from "rollup";
import packageInfo from "../../package.json";

const name = packageInfo.name;

export function isInColor(): boolean {
    return options.enabled;
}

export function enableColor(enable: boolean): void {
    options.enabled = enable;
}

let failureOccurred = false;

export function failed(): boolean {
    return failureOccurred;
}

export function debug(...message: unknown[]): void {
    console.log(`[${name}] ${message.join(" ")}`);
}

export function error(...message: unknown[]): void {
    console.log(`[${red(name)}] ${red(message.join(" "))}`);
}

export function info(...message: unknown[]): void {
    console.log(`[${green(name)}] ${green(message.join(" "))}`);
}

export function log(...message: unknown[]): void {
    console.log(`[${blue(name)}] ${blue(message.join(" "))}`);
}

export function trace(...message: unknown[]): void {
    console.log(`[${gray(name)}] ${gray(message.join(" "))}`);
}

export function warn(...message: unknown[]): void {
    console.log(`[${yellow(name)}] ${yellow(message.join(" "))}`);
}

export function line(...message: unknown[]): void {
    console.log(...message);
}

function tryPrintRollupError(rollupError: RollupError): void {
    error(rollupError);

    let fileLine = "";
    if (rollupError.loc) {
        // Error has a location
        if (rollupError.loc.file) {
            fileLine += rollupError.loc.file;
            if (rollupError.loc.line) {
                fileLine += `:${rollupError.loc.line}`;
                if (rollupError.loc.column) {
                    fileLine += `:${rollupError.loc.column}`;
                }
            }
        }
    }

    if (fileLine) {
        console.log(fileLine);
    }

    if (rollupError.frame) {
        console.log(rollupError.frame);
    }
}

export function exception(maybeException: unknown): void {
    if (isError(maybeException)) {
        tryPrintRollupError(maybeException as RollupError);
    } else {
        error(maybeException);
    }
}

export function failure(maybeException: unknown): void {
    exception(maybeException);
    failureOccurred = true;
}
