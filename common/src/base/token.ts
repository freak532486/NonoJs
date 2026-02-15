/**
 * A token for a component. It can be used to fetch a component from an entity.
 */
export class Token<T> {

    /**
     * Creates a new token for component type T with the given key.
     */
    constructor(
        public readonly key: string
    ) {}
}