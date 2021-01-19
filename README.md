# Rolete

Simple (read quick and dirty) library bundler built on Rollup.

_Rolete_ is inspired by [MSBuild](https://docs.microsoft.com/visualstudio/msbuild) and
[Laravel Mix](https://laravel-mix.com/).

## License

_Rolete_ is licensed under the [MIT](LICENSE) license.

## Requirements

These can differ depending on what features you use. See the sections on [Built-in plug-ins](#built-in-plug-ins) and
[Entry-point module](#entry-point-module) for more information. All other dependencies are handled by your package manager.

## Installation

Simply install _Rolete_ with your favorite package manager.
- [npm](https://www.npmjs.com/); `npm install --save-dev rolete`.
- [yarn](https://yarnpkg.com/); `yarn add rolete --dev`
- [pnpm](https://pnpm.js.org/); `pnpm add -D rolete`

## Example

- `package.json`
    ```json
    {
        "name": "awesome-library",
        "main": "dist/index.cjs.js",
        "module": "dist/index.esm.js",
        "typings": "dist/types/index.d.ts",
        "rolete": {
            "name": "AwesomeLibrary",
            "input": "src/index.ts",
            "targets": {
              "cjs": "#main",
              "esm": "#module",
              "iife": "dist/index.iife.js"
            },
            "globals": {
                "lodash": "_"
            }
        }
    }
    ```

- `rolete.config.js`
    ```js
    import path from "path";
    import rolete from "@rolete/rolete";
    
    export default rolete(({ target, outPath, typings }, { typescript, output }) => {
        if (!typings) {
            throw new Error("Missing typing output path");
        }
    
        // ### Module configuration ("module"), we need to generate type declarations.
        if (target === "esm") {
            output({
                dir:            path.dirname(outPath),
                entryFileNames: path.basename(outPath),
            });
            typescript({
                module:         "esnext",
                target:         "es2015",
                noEmitOnError:  true,
                declaration:    true,
                declarationDir: path.dirname(typings),
                outDir:         path.dirname(outPath),
                rootDir:        "./src/",
                include:        ["./src/**/*.ts"],
            });
        }
    });
    ```

## Configuration

### Entry-point module
> TODO
### Output
> TODO
### `package.json`
```ts
type WithRoleteConfig = PackageDotJson & {
    // Optional Rolete configuration. If not "package.json", a "rolete.config.js" must be used.
    rolete?: {
        // The namespace of the package when exported in UMD or IIFE format. Defaults to a camel case transform of the
        // package name.
        name?: string;
        // The input or entry-point module. If not specified in "package.json", it must be specified in
        // "rolete.config.js".
        input?: string;
        // The targets to build and output files for the specified targets. If "targets" is not in "package.json", then
        // all targets will be called with "rolete.config.js". In which case, only targets with an output will be built.
        targets?: {
            cjs?: string;
            esm?: string;
            amd?: string;
            umd?: string;
            iife?: string;
        };
        globals: {
            [library: string]: /* name/variable */ string;
        }
    }
};
```
#### References
> TODO
`#${pathInPackageDotJson}`

### `rolete.config.js`
```js
import rolete from "@rolete/rolete";

export default rolete((
    /* Build variables */
    { 
        /* The build configuration specified in -c or -p CONFIGURATION */
        configuration, // "prod"|"dev"
        /* The format target */
        target, // "cjs"|"esm"|"amd"|"umd"|"iife"
        /* The package.json data */
        packageJson, // typeof package.json
        /* Environment */
        env, // typeof process.env
        /* -p passed properties */
        properties, // { [property: string]: string|boolean }
        /* UMD/IIFE namespace name */
        name, // string
        /* "rolete.input" value in "package.json" if specified */
        inPath, // undefined|string
        /* "rolete.targets[target]" value in "package.json" if specified */
        outPath, // undefined|string
        /* "types" or "typings" value in "package.json" if specified */
        typings, // undefined|string
    },
    /* RoleteContext */
    {
        /* Allows the specification or override of input options. */
        input, // (input: InputOptions) => void
        /* Allows the specification or override of output options. */
        output, // (output: OutputOptions) => void
        /* Allows the specification or override of global dependencies and their UMD/IIFE global identifier. */
        globals, // (globals: { [package: string]: /* global name/variable */ string }) => void
        /* Methods add by plug-ins */
        ...plugins // { [name: string]: (...args: unknown[]) => void) }
    }) => {
    // Configuration...
});
```

## Plug-ins

### Built-in plug-ins
#### Alias
Enables `@rollup/plugin-alias` and defines aliases for import paths.
```ts
interface RoleteContext {
    readonly alias: (entries: RollupAliasOptions["entries"], options?: RollupAliasOptions) => void;
}
```
#### Auto-install
Enables `@rollup/plugin-auto-install`.
```ts
interface RoleteContext {
    readonly autoInstall: (options: RollupAutoInstallOptions) => void;
}
```
#### Babel
Applies additional options for Babel and `@rollup/plugin-babel`. This plug-in is always enabled when the entry-point is
a JavaScript module. Enabling onOutput will force enable the plug-in and use it as on the output file.
```ts
interface RoleteContext {
    readonly babel: (options: RollupBabelInputPluginOptions|RollupBabelOutputPluginOptions, onOutput?: boolean) => void;
}
```
#### CommonJS
Applies additional options to `@rollup/plugin-commonjs`. This plug-in is always enabled.
```ts
interface RoleteContext {
    readonly commonJs: (options: RollupCommonJSOptions) => void;
}
```
#### Node resolve
Applies additional options to `@rollup/plugin-node-resolve`. This plug-in is always enabled.
```ts
interface RoleteContext {
    readonly resolve: (options: RollupNodeResolveOptions) => void;
}
```
#### Tenser
type Options = 
Applies additional options to `rollup-plugin-terser` and force enables the plug-in. This plug-in is always enabled on
production builds with `-c prod`.
```ts
export interface Options extends Omit<MinifyOptions, "sourceMap"> {
    numWorkers?: number;
}

interface RoleteContext {
    readonly tenser: (options: Options) => void;
}
```
#### TypeScript
Applies additional options to `@rollup/plugin-typescript`. This plug-in is always enabled when the entry-point is a
TypeScript module.
```ts
interface RoleteContext {
    readonly typescript: (options: RollupTypescriptOptions) => void;
}
```

### Creating plug-ins
> TODO
### Using Rollup plug-ins
> TODO

## Acknowledgements

> TODO

## Roadmap

There is currently no roadmap per se for _Rolete_, but the [PLANS](PLANS.md) file tracks ideas for the future of
_Rolete_. If an issue was filed, it may appear in the plans file.
