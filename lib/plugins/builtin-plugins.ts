import { AliasPlugin } from "./alias-plugin";
import { AutoInstallPlugin } from "./auto-install-plugin";
import { BabelPlugin } from "./babel-plugin";
import { CommonjsPlugin } from "./commonjs-plugin";
import { GlobalsPlugin } from "./globals-plugin";
import { InputPlugin } from "./input-plugin";
import { NodeResolvePlugin } from "./node-resolve-plugin";
import { OutputPlugin } from "./output-plugin";
import { TerserPlugin } from "./terser-plugin";
import { TypeScriptPlugin } from "./type-script-plugin";

// XXX: The order is important. See the documentation for the plug-in.
export const defaultPlugins = [
    AliasPlugin,
    AutoInstallPlugin,
    BabelPlugin,
    CommonjsPlugin,
    GlobalsPlugin,
    InputPlugin,
    NodeResolvePlugin,
    OutputPlugin,
    TerserPlugin,
    TypeScriptPlugin,
];
