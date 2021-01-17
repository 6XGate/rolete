import { promises as fsUtils } from "fs";
import pathUtils from "path";
import { camelCase, get, isEmpty } from "lodash";
import { Target } from "../variables";

export type MinimalPackageDotJson = {
    name?: string;
    types?: string;
    typings?: string;
    rolete?: {
        name?: string;
        input?: string;
        targets?: { [P in Target]?: string };
    };

    dependencies?: {
        [packageId: string]: string;
    };

    devDependencies?: {
        [packageId: string]: string;
    };
};

export async function findPackageDotJson(): Promise<string> {
    let at = process.cwd();
    let parts = pathUtils.parse(at);
    while (parts.base.length !== 0 && parts.root !== parts.dir) {
        const jsonPath = pathUtils.join(at, "package.json");
        try {
            // eslint-disable-next-line no-await-in-loop
            await fsUtils.stat(jsonPath);

            return jsonPath;
        } catch (error: unknown) {
            // Ignored...
        }

        at = pathUtils.resolve(pathUtils.join(at, ".."));
        parts = pathUtils.parse(at);
    }

    throw new Error("Missing package.json");
}

function parseValue(packageInfo: MinimalPackageDotJson, path: string, value: string): string {
    if (isEmpty(value)) {
        throw new Error(`"${path}" is present but empty`);
    }

    if (value.startsWith("#")) {
        value = value.slice(1);
        const found = get(packageInfo, value, null) as null|string;
        if (found === null) {
            throw new ReferenceError(`"${path}" references package.json[${value}] which doesn't exists`);
        } else if (isEmpty(value)) {
            throw new Error(`"${path}" references package.json[${value}] which is present but empty`);
        }

        return found;
    }

    return value;
}

export type Outputs = { [P in Target]?: string };

export type PackageConfiguration = {
    dependencies: { [packageId: string]: string };
    typings: undefined|string;
    outputs: Outputs;
    name: string;
    input?: string;
};

export async function readPackageConfig(): Promise<PackageConfiguration> {
    const jsonPath = await findPackageDotJson();
    const packageInfo = await import(jsonPath) as MinimalPackageDotJson;

    if (!packageInfo.name) {
        throw new Error("Missing name: require('package.json').name'");
    }

    const packageConf: PackageConfiguration = {
        dependencies: { ...packageInfo.dependencies, ...packageInfo.devDependencies },
        typings:      packageInfo.typings || packageInfo.types,
        outputs:      { },
        name:         camelCase(packageInfo.name),
    };

    if (packageInfo.rolete) {
        if (packageInfo.rolete.name) {
            packageConf.name = parseValue(packageInfo, "rolete.name", packageInfo.rolete.name);
        }

        if (packageInfo.rolete.input) {
            packageConf.input = parseValue(packageInfo, "rolete.input", packageInfo.rolete.input);
        }

        if (packageInfo.rolete.targets) {
            const outputs = {} as Outputs;
            for (const target of Target) {
                const value = packageInfo.rolete.targets[target];
                if (value) {
                    outputs[target] = parseValue(packageInfo, `rolete.targets.${target}`, value);
                }
            }

            if (isEmpty(outputs)) {
                throw new Error('"rolete.targets" is specified but empty');
            }

            packageConf.outputs = outputs;
        }
    }

    return packageConf;
}
