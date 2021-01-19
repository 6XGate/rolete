type Node<T> = {
    item: T;
    before: Set<Node<T>>;
    inDegree: number;
};

export class DependencySort<T> {
    private readonly nodes = new Map<T, Node<T>>();

    addBefore(item: T, deps: T[]): void {
        const node = this.getNode(item);
        for (const dep of deps) {
            node.before.add(this.getNode(dep));
        }
    }

    addAfter(item: T, deps: T[]): void {
        for (const dep of deps) {
            this.getNode(dep).before.add(this.getNode(item));
        }
    }

    getNode(item: T): Node<T> {
        let node = this.nodes.get(item);
        if (node) {
            return node;
        }

        this.nodes.set(item, node = { item, before: new Set<Node<T>>(), inDegree: 0 });

        return node;
    }

    getOrder(): T[] {
        // The top order list.
        const order = [] as T[];

        // Reset the in-degree.
        for (const node of this.nodes.values()) {
            node.inDegree = 0;
        }

        // Calculate the in-degree.
        for (const node of this.nodes.values()) {
            for (const dest of node.before) {
                ++dest.inDegree;
            }
        }

        // Initialize the queue.
        const queue = [] as Node<T>[];
        for (const node of this.nodes.values()) {
            if (node.inDegree === 0) {
                queue.unshift(node);
            }
        }

        // Run the queue.
        let visited = 0;
        while (queue.length > 0) {
            ++visited;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const node = queue.pop()!;
            order.push(node.item);

            for (const neighbor of node.before) {
                if (--neighbor.inDegree === 0) {
                    queue.unshift(neighbor);
                }
            }
        }

        if (visited !== this.nodes.size) {
            throw new Error("Cyclic dependency detected in plug-ins");
        }

        return order;
    }
}
