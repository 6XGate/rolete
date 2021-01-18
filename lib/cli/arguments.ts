import { once } from "lodash";
import yargs from "yargs";

function parseProperties(values: string[]): { [P in string]?: string|boolean } {
    const result = {} as { [P in string]?: string|boolean };
    for (const value of values) {
        const separator = value.indexOf(":");
        if (separator !== -1) {
            const key = value.substr(0, separator);
            result[key] = value.substr(separator + 1);
        } else {
            result[value] = true;
        }
    }

    return result;
}

export const getArguments = once(() =>
    yargs(process.argv.splice(2)).
        usage("Usage: $0 [options]").
        /***/strict().
        boolean("ansi").
        /***/describe("ansi", "Enables colors").
        boolean("no-ansi").
        /***/describe("no-ansi", "Disables colors").
        choices("c", [ "prod", "dev" ] as const).
        /***/alias("c", "config").alias("c", "configuration").
        /***/describe("c", "Configuration, 'dev' (default) or 'prod'").
        array("p").
        /***/coerce("p", parseProperties).alias("p", "property").nargs("p", 1).
        /***/describe("p", "Define a property, [NAME]:[VALUE] or [NAME]").
        help(true).
        /***/alias("h", "help").
        check(argv => {
            // Ensure -p CONFIGURATION is properly defined.
            if (argv.p && argv.p.CONFIGURATION) {
                if (![ "prod", "dev" ].includes(String(argv.p.CONFIGURATION))) {
                    throw new TypeError("CONFIGURATION property may only be 'dev' or 'prod'");
                }

                if (argv.c && argv.c !== argv.p.CONFIGURATION) {
                    throw new TypeError("CONFIGURATION property and -c must match");
                }
            }

            return true;
        }).
        wrap(Math.min(110, yargs.terminalWidth())).
        argv);

export type Arguments = ReturnType<typeof getArguments>;
