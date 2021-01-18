import { toString } from "lodash";

function leading(line: string): number {
    let indent = 0;
    for (const ch of line) {
        if (ch !== " " && ch !== "\t") {
            break;
        } else {
            ++indent;
        }
    }

    return indent;
}

function minIndent(lines: string[]): number {
    let min = 0;
    for (const line of lines) {
        const to = leading(line);
        min = Math.min(min, to) || to;
    }

    return min;
}

export function dedent(literals: string): string;
export function dedent(literals: string|string[]|TemplateStringsArray, ...values: unknown[]): string;
export function dedent(literals: string|string[]|TemplateStringsArray, ...values: unknown[]): string {
    const parts = Array.isArray(literals) ? literals : [literals];
    const raw = `${toString(parts[0])}${values.map((value, i) => `${toString(value)}${toString(parts[i + 1])}`).join("")}`;
    const lines = raw.split(/\r?\n/u).filter((line, i, c) => line.length !== 0 || (i !== 0 && i !== c.length - 1));
    const init = minIndent(lines);

    return lines.map(line => line.slice(init).trimEnd()).join("\n");
}
