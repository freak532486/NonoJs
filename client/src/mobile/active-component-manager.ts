import { Component, Context } from "nonojs-common";
import UIComponent from "../common/types/ui-component";
import MobileRootComponent from "./root-component/mobile-root";

export default class ActiveComponentManager extends Component
{
    #activeComponent?: UIComponent;
    #activeView?: HTMLElement;

    constructor(
        private readonly rootComponent: MobileRootComponent
    ) {
        super();
    }

    /**
     * Replaces the current active component with the given component.
     */
    async setActiveComponent(component: UIComponent) {
        if (this.#activeComponent) {
            this.#activeComponent.cleanup();
        }

        const mainDiv = this.rootComponent.mainContainer;

        this.#activeComponent?.cleanup();
        this.#activeView?.remove();
        this.#activeView = await component.create(mainDiv);
        this.#activeComponent = component;
    }


};