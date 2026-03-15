import timer from "./timer.html"
import "./timer.css"
import { htmlToElement } from "../../../common/services/html-to-element.js";
import { getTimeString } from "../../../common/services/playfield/timer-formatting";

export class Timer {

    #view: HTMLElement | undefined;
    #curElapsed: number = 0;
    #lastTs: number = 0;
    #paused: boolean = false;

    /**
     * Creates a new timer component. Can be started with some already-elapsed time if desired.
     */
    constructor(elapsedSeconds: number = 0) {
        this.restart(elapsedSeconds);
    }

    /**
     * Initialized and attaches this component
     */
    async init(parent: HTMLElement) {
        this.#view = await htmlToElement(timer);
        parent.appendChild(this.view);

        this.#updateDisplayedTime();

        /* Start animation for timer */
        const anim = (ts: number) => {
            if (this.#paused || this.#lastTs == 0) {
                this.#lastTs = ts;
                requestAnimationFrame(anim);
                return;
            }

            const elapsed = ts - this.#lastTs;
            this.#curElapsed += elapsed / 1000;

            this.#lastTs = ts;
            this.#updateDisplayedTime();
            requestAnimationFrame(anim);
        };

        requestAnimationFrame(anim);
    }

    get view(): HTMLElement {
        if (!this.#view) {
            throw new Error("init() has not been called");
        }

        return this.#view;
    }

    get elapsed(): number {
        return this.#curElapsed;
    }

    set elapsed(val: number) {
        this.#curElapsed = val;
        this.#updateDisplayedTime();
    }

    getElapsedTimeAsString(): string {
        return getTimeString(this.#curElapsed);
    }

    /**
     * Returns true if the timer is currently paused.
     */
    get paused(): boolean {
        return this.#paused;
    }

    /**
     * Pauses or unpauses the timer.
     */
    set paused(value: boolean) {
        this.#paused = value;
    }

    /**
     * Restarts the timer. This does not unpause the timer!
     */
    restart(startElapsed: number = 0) {
        this.#curElapsed = startElapsed;
        this.#updateDisplayedTime();
    }

    #updateDisplayedTime() {
        if (!this.#view) {
            return;
        }

        const timeSpan = this.#view.querySelector(".time") as HTMLElement;
        timeSpan.textContent = getTimeString(this.#curElapsed);
    }

}