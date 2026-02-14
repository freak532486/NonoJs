import { Component, Context } from "nonojs-common";
import UIComponent from "./common/ui-component";

const mainDiv: HTMLElement = document.getElementById("main-div")!;

export default class ActiveComponentManager extends Component
{
    #activeComponent?: UIComponent;

    /**
     * Replaces the current active component with the given component.
     */
    setActiveComponent(component: UIComponent) {
        if (this.#activeComponent) {
            this.#activeComponent.cleanup();
        }

        mainDiv.replaceChildren();
        component.create(mainDiv);
        this.#activeComponent = component;
    }


};