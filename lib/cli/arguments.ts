import { bold, italic } from "colorette";
import { once } from "lodash";
import yargs from "yargs";
import { Target } from "../core/values";
import * as logger from "../utils/logger";
import { oneliner } from "../utils/tags";

export type Properties = { [P in string]?: string | boolean };

function parseProperties(values: string[]): Properties {
    const result = {} as { [P in string]?: string | boolean };
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

const targets = Target.map(target => `"${bold(target)}"`);

function parseTargets(values: string[]): Target[] {
    for (const value of values) {
        if (!Target.includes(value as Target)) {
            throw new Error(`Invalid target "${bold(value)}"`);
        }
    }

    return values as Target[];
}

export const getArguments = once(() =>
    yargs.
        usage("Usage: $0 [options]").
        /***/strict().
        // /***/completion().
        boolean("ansi").
        /***/describe("ansi", "Enables colors").
        /***/describe("no-ansi", "Disables colors").
        /***/hide("ansi").hide("no-ansi").
        boolean("logo").
        /***/describe("logo", "Enables printing the logo on start-up").
        /***/describe("no-logo", "Disables printing the logo on start-up").
        /***/hide("logo").hide("no-logo").
        choices("c", [ "prod", "dev" ] as const).
        /***/alias("c", "config").alias("c", "configuration").
        /***/describe("c", `Configuration, "${bold("dev")}" (default) or "${bold("prod")}"`).
        array("t").
        /***/coerce("t", parseTargets).alias("t", "target").nargs("t", 1).
        /***/describe("t", `Build provided targets, may be ${targets.join(", ")}`).
        array("p").
        /***/coerce("p", parseProperties).alias("p", "property").nargs("p", 1).
        /***/describe("p", `Defines a property, ${italic("name[:value]")}`).
        help(true).
        /***/alias("h", "help").
        showHidden().
        wrap(Math.min(110, yargs.terminalWidth())).
        // onFinishCommand(() => { process.exit(0) }).
        check(argv => {
            // Ensure off-limits properties aren't specified.
            if (argv.p) {
                if (argv.p.configuration) {
                    throw new Error(oneliner`"configuration" property may not be set,
                        use "-c ${String(argv.p.configuration)}" instead.`);
                }

                if (argv.p.target) {
                    throw new Error('"target" may not be set.');
                }
            }

            return true;
        }).
        parseSync(process.argv.splice(2), { }, (error, argv, output) => {
            // Trap the color flag.
            if ("ansi" in argv) {
                logger.enableColor(argv.ansi || false);
            }

            // By-pass the logger for yargs output.
            if (error) {
                logger.error(String(error));
            } else {
                logger.write("log", output);
            }

            if (error || output.length > 0) {
                // Exit if yargs produced any output.
                process.exit(0);
            }
        }));

export type Arguments = ReturnType<typeof getArguments>;
