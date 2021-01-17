export const Configuration = [ "dev", "prod" ] as const;
export type Configuration = typeof Configuration[number];

export const Target = [ "cjs", "esm", "amd", "umd", "iife" ] as const;
export type Target = typeof Target[number];

export type BuildVariables = {
    configuration: Configuration;
    target: Target;
    env: typeof process.env;
    properties: { [P in string]?: string|boolean };
    name: string;
    inPath?: string;
    outPath?: string;
    typings?: string;
};
