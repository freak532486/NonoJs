import { attachCss, loadHtml } from "../../loader.js";

/** @enum {number} */
export const ControlPadButton = Object.freeze({
    LEFT: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 3,
    WHITE: 4,
    BLACK: 5,
    ERASE: 6
});

export class ControlPad {
    #view = /** @type {HTMLElement | null} */ (null);

    /**
     * Creates and attaches this control pad.
     * 
     * @param {HTMLElement} parent 
     */
    async init(parent) {
        attachCss("/src/playfield/control-pad/control-pad.css");
        this.#view = await loadHtml("/src/playfield/control-pad/control-pad.html");

        parent.appendChild(this.#view);
    }

    get view() {
        if (!this.#view) {
            throw new Error("init() was not called");
        }

        return this.#view;
    }

    /**
     * Sets the callback function for a button.
     * 
     * @param {ControlPadButton} button
     * @param {() => void} fn 
     */
    setButtonFunction(button, fn) {
        this.getButton(button).onmouseup = ev => {
            if (ev.button == 0) {
                fn();
            }
        }
    }

     /**
     * Returns the element for the given button.
     * 
     * @param {ControlPadButton} button
     * @returns {HTMLInputElement}
     */
    getButton(button) {
        let buttonId = null;

        switch (button) {
            case ControlPadButton.LEFT: buttonId = "control-left"; break;
            case ControlPadButton.UP: buttonId = "control-up"; break;
            case ControlPadButton.DOWN: buttonId = "control-down"; break;
            case ControlPadButton.RIGHT: buttonId = "control-right"; break;
            case ControlPadButton.BLACK: buttonId = "control-black"; break;
            case ControlPadButton.WHITE: buttonId = "control-white"; break;
            case ControlPadButton.ERASE: buttonId = "control-erase"; break;
        }

        if (!buttonId) {
            throw new Error("Unknown button: " + button);
        }

        return /** @type {HTMLInputElement} */ (this.view.querySelector("#" + buttonId));
    }

    isWhiteChecked() {
        const btnWhite = /** @type {HTMLInputElement} */ (this.view.querySelector("#control-white"));
        return btnWhite.checked;
    }

    isBlackChecked() {
        const btnBlack = /** @type {HTMLInputElement} */ (this.view.querySelector("#control-black"));
        return btnBlack.checked;
    }
}