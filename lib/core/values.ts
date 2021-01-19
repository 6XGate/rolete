// eslint-disable-next-line @typescript-eslint/naming-convention
export const Configuration = [ "dev", "prod" ] as const;
export type Configuration = typeof Configuration[number];

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Target = [ "cjs", "esm", "amd", "umd", "iife" ] as const;
export type Target = typeof Target[number];
