
export class ScalingMap<Key, Value> {

    private _keys: Key[] = [];
    private data: Map<Key, Value> = new Map<Key, Value>();

    constructor(
        public numberToKeep: number = 2000,
    ) {
    }

    public has(key: Key): boolean {
        return this.data.has(key);
    }

    public get(key: Key): Value | undefined {
        return this.data.get(key);
    }

    public set(key: Key, value: Value): Key[] {
        this._keys.push(key);
        this.data.set(key, value);
        const deleted: Key[] = [];
        while (this.data.size > this.numberToKeep) {
            const toDelete = this._keys.shift();
            if (toDelete && toDelete !== key) {
                this.data.delete(toDelete);
                deleted.push(toDelete);
            }
        }
        return deleted;
    }

    public get size(): number {
        return this.data.size;
    }

    public keys(): IterableIterator<Key> {
        return this.data.keys();
    }

    public delete(key: Key): boolean {
        return this.data.delete(key);
    }

}
