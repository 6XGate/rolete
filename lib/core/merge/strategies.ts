import type { MergeStrategies } from "./merge";
import { ignore, mergeInput, mergeMaybeArray, replace } from "./merge";

/** The merge strategies for the output configuration. Anything not listed is automatically `ignore`. */
export const outputStrategies: MergeStrategies = {
    // ### Core functionality
    dir:     replace,
    file:    replace,
    format:  replace,
    globals: ignore,
    name:    replace,
    plugins: mergeMaybeArray,

    // ### Advanced functionality
    assetFileNames:          replace,
    banner:                  replace,
    footer:                  replace,
    chunkFileNames:          replace,
    compact:                 replace,
    entryFileNames:          replace,
    extend:                  replace,
    hoistTransitiveImports:  replace,
    inlineDynamicImports:    replace,
    interop:                 replace,
    intro:                   replace,
    outro:                   replace,
    manualChunks:            replace,
    minifyInternalExports:   replace,
    paths:                   replace,
    preserveModules:         replace,
    preserveModulesRoot:     replace,
    sourcemap:               ignore,
    sourcemapExcludeSources: replace,
    sourcemapFile:           replace,
    sourcemapPathTransform:  replace,

    // ### Danger zone
    exports: replace,
};

/** The merge strategies for input configuration. Anything not listed is automatically `ignore`. */
export const inputStrategies: MergeStrategies = {
    // ### Core functionality
    external: ignore,
    input:    mergeInput,
    plugins:  mergeMaybeArray,

    // ### Advanced functionality
    onwarn:                  replace,
    preserveEntrySignatures: replace,
    strictDeprecations:      replace,
};
