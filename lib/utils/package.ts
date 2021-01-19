import pathUtils from "path";
import { bold, italic } from "colorette";
import { camelCase, get, isEmpty } from "lodash";
import pkgDir from "pkg-dir";
import type { PackageJson } from "type-fest";
import { Target } from "../core/values";

export interface RoletePackageConfig {
    name?: string;
    input?: string;
    targets?: { [P in Target]?: string };
}

export interface PackageJsonRolete extends PackageJson {
    rolete?: RoletePackageConfig;
}

export async function findPackageDotJson(): Promise<string> {
    const jsonPath = await pkgDir(process.cwd());
    if (!jsonPath) {
        throw new Error("No package.json found, initialize your package before using rolete");
    }

    return pathUtils.join(jsonPath, "package.json");
}

function parseValue(packageInfo: PackageJsonRolete, path: string, value: string): string {
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
    packageJson: PackageJsonRolete;
    dependencies: { [PackageID in string]?: string };
    typings: undefined|string;
    outputs: Outputs;
    name: string;
    input?: string;
};

export async function readPackageConfig(): Promise<PackageConfiguration> {
    const jsonPath = await findPackageDotJson();
    const packageInfo = await import(jsonPath) as PackageJsonRolete;

    if (!packageInfo.name) {
        throw new Error(`Missing "${bold("name")}" in ${italic("package.json")}`);
    }

    const packageConf: PackageConfiguration = {
        packageJson:  packageInfo,
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
                throw new Error(`"${bold("rolete.targets")}" in ${italic("package.json")} is specified but empty`);
            }

            packageConf.outputs = outputs;
        }
    }

    return packageConf;
}
