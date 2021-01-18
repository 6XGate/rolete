import { AliasPlugin } from "./alias-plugin";
import { AutoInstallPlugin } from "./auto-install-plugin";
import { BabelPlugin } from "./babel-plugin";
import { CommonjsPlugin } from "./commonjs-plugin";
import { NodeResolvePlugin } from "./node-resolve-plugin";
import { TerserPlugin } from "./terser-plugin";
import { TypeScriptPlugin } from "./type-script-plugin";

// TODO: The order is important. See the documentation for the plug-in.
export const defaultPlugins = [
    TypeScriptPlugin,
    AutoInstallPlugin,
    NodeResolvePlugin,
    CommonjsPlugin,
    AliasPlugin,
    BabelPlugin,
    TerserPlugin,
];
