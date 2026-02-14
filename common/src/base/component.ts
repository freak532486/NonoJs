import { Context } from "./context.js";

export class Component
{
    #ctx?: Context;

    get ctx(): Context {
        if (!this.#ctx) {
            throw new Error("Component was not added to a context.");
        }

        return this.#ctx;
    }

    set ctx(c: Context | undefined) {
        this.#ctx = c;
    }
}