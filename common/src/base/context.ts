import { Component } from "./component.js";
import { Token } from "./token.js";


export class Context
{

    #componentMap = new Map<string, Component>();

    constructor (private readonly parent: Context | undefined = undefined)
    {}


    /**
     * Adds a component to this entity. Throws if a component with this token already exists. Returns the added
     * component.
     */
    addComponent<T extends Component>(token: Token<T>, component: T): T
    {
        if (component == undefined || component == null) {
            throw new Error("Cannot add null or undefined as component");
        }

        if (this.#componentMap.has(token.key)) {
            throw new Error("Entity already contains component with key '" + token.key + "'");
        }

        this.#componentMap.set(token.key, component);
        component.ctx = this;
        return component;
    }

    /**
     * Removes the component with the given token. Returns 'false' if no such component existed.
     */
    removeComponent<T extends Component>(token: Token<T>): boolean
    {
        const component = this.#componentMap.get(token.key);
        if (!component) {
            return false;
        }

        this.#componentMap.delete(token.key);
        component.ctx = undefined;
        return true;
    }

    /**
     * Returns the component with the given key inside this entity.
     */
    getComponent<T extends Component>(token: Token<T>): T
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
    tryGetComponent<T extends Component>(token: Token<T>): T | undefined
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