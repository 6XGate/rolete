import pathUtils from "path";
import { options as colorOptions, blue, gray, green, red, yellow } from "colorette";
import { isError, isString } from "lodash";
import type { RollupError } from "rollup";
import stripAnsi from "strip-ansi";
import packageInfo from "../../package.json";

type LogLevel = "debug" | "error" | "info" | "log" | "trace" | "warn";
type Style = (message: string) => string;

const name = pathUtils.basename(packageInfo.name);
const normal = (text: string): string => text;

export function enableColor(enable: boolean): void {
    colorOptions.enabled = enable;
}

let failureOccurred = false;

export function failed(): boolean {
    return failureOccurred;
}

export function format(level: LogLevel, style: Style, message: unknown, ...data: unknown[]): void {
    colorOptions.enabled ?
        console[level](`[${style(name)}] ${style(String(message))}`, ...data) :
        console[level](
            `[${name}] ${stripAnsi(String(message))}`,
            ...data.map(entry => (isString(entry) ? stripAnsi(entry) : entry)),
        );
}

export function write(level: LogLevel, message: unknown, ...data: unknown[]): void {
    colorOptions.enabled ?
        console[level](String(message), ...data) :
        console[level](
            stripAnsi(String(message)),
            ...data.map(entry => (isString(entry) ? stripAnsi(entry) : entry)),
        );
}

export const debug = format.bind(null, "debug", normal);
export const error = format.bind(null, "error", red);
export const info = format.bind(null, "info", green);
export const log = format.bind(null, "log", blue);
export const trace = format.bind(null, "trace", gray);
export const warn = format.bind(null, "warn", yellow);

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
        write("log", fileLine);
    }

    if (rollupError.frame) {
        write("log", rollupError.frame);
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

export function fatal(maybeException: unknown): never {
    exception(maybeException);
    process.exit(1);
}
