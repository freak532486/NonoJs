import { Entity } from "nonojs-common";

export default interface UIComponent
{

    /**
     * Creates the component and attaches it to the given parent element. Returns the created HTML element.
     */
    create(parent: HTMLElement): Promise<HTMLElement> | HTMLElement;

    /**
     * Performs any necessary cleanup when the component is removed. This should _not_ remove the component from the
     * DOM.
     */
    cleanup(): Promise<void> | void;

}