import type { InputOptions, OutputOptions } from "rollup";
import { DependencySort } from "../utils/sort";
import type { RoleteContext, RoleteContextData } from "./context";

export class RoletePlugin {
    /** Determines whether the plug-in is enabled. */
    // eslint-disable-next-line class-methods-use-this
    enabled(_data: RoleteContextData): boolean {
        return false;
    }

    /** Prepares the plugin, resetting options, and adding extension methods to the roller context. */
    // eslint-disable-next-line class-methods-use-this
    prepare(_roll: RoleteContext, _data: RoleteContextData): void {
        // Does nothing by default.
    }

    /** Indicates the plug-in before which this one must be handled.  */
    // eslint-disable-next-line class-methods-use-this
    before(): (typeof RoletePlugin)[] {
        return [];
    }

    /** Indicates the plug-in after which this one must be handled.  */
    // eslint-disable-next-line class-methods-use-this
    after(): (typeof RoletePlugin)[] {
        return [];
    }

    /** Indicates the peer dependencies required for the plug-in. */
    // eslint-disable-next-line class-methods-use-this
    dependencies(): string[] {
        return [];
    }

    /** Defines additional input options to merge. */
    // eslint-disable-next-line class-methods-use-this
    input(_data: RoleteContextData): Promise<InputOptions> {
        // Defines additional input options.
        return Promise.resolve({ });
    }

    /** Defines additional output options to merge. */
    // eslint-disable-next-line class-methods-use-this
    output(_data: RoleteContextData): Promise<OutputOptions> {
        // Defines additional output options.
        return Promise.resolve({ });
    }
}

const pluginRegistry = new Map<typeof RoletePlugin, RoletePlugin>();

// eslint-disable-next-line @typescript-eslint/naming-convention
export function registerPlugin(Plugin: typeof RoletePlugin): void {
    if (!pluginRegistry.has(Plugin)) {
        pluginRegistry.set(Plugin, new Plugin());
    }

}

function ensureMapped(plugin: typeof RoletePlugin, value: RoletePlugin | undefined): RoletePlugin {
    if (!value) {
        throw new ReferenceError(`Plugin not registered ${plugin.name}`);
    }

    return value;
}

export function getPlugins(): RoletePlugin[] {
    const sorter = new DependencySort<RoletePlugin>();
    for (const plugin of pluginRegistry.values()) {
        sorter.addBefore(plugin, plugin.before().map(dep => ensureMapped(dep, pluginRegistry.get(dep))));
        sorter.addAfter(plugin, plugin.after().map(dep => ensureMapped(dep, pluginRegistry.get(dep))));
    }

    return sorter.getOrder();
}
