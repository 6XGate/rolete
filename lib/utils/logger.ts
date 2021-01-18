import pathUtils from "path";
import { options as colorOptions, blue, gray, green, red, yellow } from "colorette";
import { isError, isString, toString } from "lodash";
import type { RollupError } from "rollup";
import stripAnsi from "strip-ansi";
import packageInfo from "../../package.json";
import { getArguments } from "../cli/arguments";

const name = pathUtils.basename(packageInfo.name);
const args = getArguments();
if ("ansi" in args) {
    colorOptions.enabled = args.ansi || false;
}

type Style = (message: string) => string;
const normal = (text: string): string => text;

type ConsoleParams = [string, ...unknown[]];
const format = colorOptions.enabled ?
    (style: Style, message: unknown, data: unknown[]): ConsoleParams =>
        [ `[${style(name)}] ${style(toString(message))}`, ...data ] :
    (_style: Style, message: unknown, data: unknown[]): ConsoleParams =>
        [ `[${name}] ${stripAnsi(toString(message))}`, ...data.map(entry => (isString(entry) ? stripAnsi(entry) : entry)) ];

const raw = colorOptions.enabled ?
    (message: unknown, data: unknown[]): ConsoleParams =>
        [ toString(message), ...data ] :
    (message: unknown, data: unknown[]): ConsoleParams =>
        [ stripAnsi(toString(message)), ...data.map(entry => (isString(entry) ? stripAnsi(entry) : entry)) ];

export function isInColor(): boolean {
    return colorOptions.enabled;
}

export function enableColor(enable: boolean): void {
    colorOptions.enabled = enable;
}

let failureOccurred = false;

export function failed(): boolean {
    return failureOccurred;
}

export function debug(message: unknown, ...data: unknown[]): void {
    console.debug(...format(normal, message, data));
}

export function error(message: unknown, ...data: unknown[]): void {
    console.error(...format(red, message, data));
}

export function info(message: unknown, ...data: unknown[]): void {
    console.info(...format(green, message, data));
}

export function log(message: unknown, ...data: unknown[]): void {
    console.log(...format(blue, message, data));
}

export function trace(message: unknown, ...data: unknown[]): void {
    console.trace(...format(gray, message, data));
}

export function warn(message: unknown, ...data: unknown[]): void {
    console.warn(...format(yellow, message, data));
}

export function line(message: unknown, ...data: unknown[]): void {
    console.log(...raw(message, data));
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
        line(fileLine);
    }

    if (rollupError.frame) {
        line(rollupError.frame);
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
