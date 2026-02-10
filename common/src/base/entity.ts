import Token from "./token.js";

export default class Entity
{

    #componentMap = new Map<string, unknown>();

    constructor (private readonly parent: Entity | undefined = undefined)
    {}


    /**
     * Adds a component to this entity. Throws if a component with this token already exists. 
     */
    addComponent<T>(token: Token<T>, component: T): void
    {
        if (component == undefined || component == null) {
            throw new Error("Cannot add null or undefined as component");
        }

        if (this.#componentMap.has(token.key)) {
            throw new Error("Entity already contains component with key '" + token.key + "'");
        }

        this.#componentMap.set(token.key, component);
    }

    /**
     * Removes the component with the given token. Returns 'false' if no such component existed.
     */
    removeComponent<T>(token: Token<T>): boolean
    {
        return this.#componentMap.delete(token.key);
    }

    /**
     * Returns the component with the given key inside this entity.
     */
    getComponent<T>(token: Token<T>): T
    {
        const ret = this.tryGetComponent(token);
        if (ret == undefined) {
            throw new Error("Component with key '" + token + "' not found in this entity or its parents");
        }

        return ret;
    }

    /**
     * Returns the component with the given token or undefined if no such component exists in this entity.
     */
    tryGetComponent<T>(token: Token<T>): T | undefined
    {
        const ret = this.#componentMap.get(token.key);
        if (ret !== undefined) {
            return ret as T;
        }

        /* Try parent */
        if (this.parent !== undefined) {
            return this.parent.tryGetComponent(token);
        }

        /* Component not found */
        return undefined;
    }

}