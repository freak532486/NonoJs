import { Component, Context } from "nonojs-common";
import UIComponent from "./common/ui-component";
import MobileRootComponent from "./mobile-root-component/mobile-root";

export default class ActiveComponentManager extends Component
{
    #activeComponent?: UIComponent;

    constructor(
        private readonly rootComponent: MobileRootComponent
    ) {
        super();
    }

    /**
     * Replaces the current active component with the given component.
     */
    setActiveComponent(component: UIComponent) {
        if (this.#activeComponent) {
            this.#activeComponent.cleanup();
        }

        const mainDiv = this.rootComponent.mainContainer;
        mainDiv.replaceChildren();
        component.create(mainDiv);
        this.#activeComponent = component;
    }


};