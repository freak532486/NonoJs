import { Entity } from "nonojs-common";
import { CellKnowledge, NonogramState } from "../common/nonogram-types";
import UIComponent from "../common/ui-component";
import { htmlToElement } from "../loader";
import nonogramPreview from "./nonogram-preview.html";

const CELL_SIZE_PX = 16;

export class NonogramPreview implements UIComponent {

    #view?: HTMLCanvasElement;

    constructor (
        private readonly nonogram: NonogramState,
        private readonly maxWidth: number = Number.MAX_VALUE,
        private readonly maxHeight: number = Number.MAX_VALUE
    ) {}

    /**
     * Intialized and attaches the preview.
     */
    create(parent: HTMLElement): HTMLElement {
        /* Load canvas */
        this.#view = htmlToElement(nonogramPreview) as HTMLCanvasElement;
        parent.appendChild(this.#view);
        const canvasCtx = this.#view.getContext("2d") as CanvasRenderingContext2D;

        /* Fill its parent */
        this.#view.style.width = "fit-content";
        this.#view.style.height = "fit-content";

        /* Calculate width/height for cells */
        let cellsWidth = 0;
        for (let i = 0; i < this.nonogram.width; i++) {
            cellsWidth += CELL_SIZE_PX + (i % 5 == 0 ? 2 : 1); // Every fifth line is 2px
        }
        cellsWidth += 2; // Outer border is thick.

        let cellsHeight = 0;
        for (let i = 0; i < this.nonogram.height; i++) {
            cellsHeight += CELL_SIZE_PX + (i % 5 == 0 ? 2 : 1); // Every fifth line is 2px
        }
        cellsHeight += 2;

        /* Calculate width/height for hints */
        const PX_PER_HINT = 16;
        const rowHintsWidth = this.nonogram.rowHints.map(x => x.length).reduce((a, b) => a > b ? a : b) * PX_PER_HINT;
        const colHintsHeight = this.nonogram.colHints.map(x => x.length).reduce((a, b) => a > b ? a : b) * PX_PER_HINT;

        /* Scale if necessary */
        const totalWidth = rowHintsWidth + cellsWidth + 2;
        const totalHeight = colHintsHeight + cellsHeight + 2;

        const scale = Math.min(1, Math.min(this.maxWidth / totalWidth, this.maxHeight / totalHeight));

        /* Set width/height */
        this.#view.width = totalWidth;
        this.#view.height = totalHeight;
        this.#view.style.transform = "scale(" + scale + ", " + scale + ")";

        /* Draw outer border */
        canvasCtx.lineWidth = 2;

        canvasCtx.beginPath();
        canvasCtx.moveTo(1, 1);
        canvasCtx.lineTo(1, cellsHeight + colHintsHeight);
        canvasCtx.stroke();

        canvasCtx.beginPath();
        canvasCtx.moveTo(1, 1);
        canvasCtx.lineTo(cellsWidth + rowHintsWidth, 1);
        canvasCtx.stroke();

        /* Draw vertical lines */
        canvasCtx.strokeStyle = "black";

        const cellLeft = Array(this.nonogram.width + 1);
        let curX = rowHintsWidth;
        for (let i = 0; i <= this.nonogram.width; i++) {
            canvasCtx.lineWidth = (i % 5 == 0) ? 2 : 1;
            curX += canvasCtx.lineWidth / 2;

            canvasCtx.beginPath();
            canvasCtx.moveTo(curX, 0);
            canvasCtx.lineTo(curX, cellsHeight + colHintsHeight);
            canvasCtx.stroke();

            curX += canvasCtx.lineWidth / 2;
            cellLeft[i] = curX;
            curX += CELL_SIZE_PX;
        }

        /* Draw horizontal lines */
        canvasCtx.strokeStyle = "black";
        canvasCtx.fillStyle = "black";

        let curY = colHintsHeight;
        const cellTop = Array(this.nonogram.height + 1);
        for (let i = 0; i <= this.nonogram.height; i++) {
            canvasCtx.lineWidth = (i % 5 == 0) ? 2 : 1;
            curY += canvasCtx.lineWidth / 2;

            canvasCtx.beginPath();
            canvasCtx.moveTo(0, curY);
            canvasCtx.lineTo(cellsWidth + rowHintsWidth, curY);
            canvasCtx.stroke();

            curY += canvasCtx.lineWidth / 2;
            cellTop[i] = curY;
            curY += CELL_SIZE_PX;
        }

        /* Fill cells that are filled */
        for (let x = 0; x < this.nonogram.width; x++) {
            for (let y = 0; y < this.nonogram.height; y++) {
                const state = this.nonogram.getCell(x, y);

                /* Fill a rectangle for definitely-black squares */
                if (state == CellKnowledge.DEFINITELY_BLACK) {
                    const leftX = cellLeft[x];
                    const topY = cellTop[y];

                    canvasCtx.beginPath();
                    canvasCtx.roundRect(leftX + 1, topY + 1, CELL_SIZE_PX - 2, CELL_SIZE_PX - 2, [2]);
                    canvasCtx.fill();
                }

                /* Draw a cross for definitely white squares */
                if (state == CellKnowledge.DEFINITELY_WHITE) {
                    const OFFSET = 3;
                    const leftX = cellLeft[x] + OFFSET;
                    const topY = cellTop[y] + OFFSET;

                    canvasCtx.lineWidth = 2;
                    canvasCtx.lineCap = "round";

                    canvasCtx.beginPath();
                    canvasCtx.moveTo(leftX, topY);
                    canvasCtx.lineTo(leftX + CELL_SIZE_PX - 2 * OFFSET, topY + CELL_SIZE_PX - 2 * OFFSET);
                    canvasCtx.stroke();

                    canvasCtx.beginPath();
                    canvasCtx.moveTo(leftX + CELL_SIZE_PX - 2 * OFFSET, topY);
                    canvasCtx.lineTo(leftX, topY + CELL_SIZE_PX - 2 * OFFSET);
                    canvasCtx.stroke();
                }
            }
        }

        /* Draw hint numbers */
        canvasCtx.font = "bold 8pt Verdana";

        /* Draw row hints */
        let hintCurY = 6 + colHintsHeight + CELL_SIZE_PX / 2;
        for (let y = 0; y < this.nonogram.height; y++) {
            const hints = this.nonogram.rowHints[y];
            let curX = rowHintsWidth - 2;

            for (let i = 0; i < hints.length; i++) {
                const hint = hints[hints.length - i - 1];

                canvasCtx.textAlign = "right";
                canvasCtx.fillText(String(hint), curX, hintCurY);

                curX -= PX_PER_HINT;
            }

            hintCurY += CELL_SIZE_PX;
            hintCurY += (y % 5 == 4) ? 2 : 1;
        }

        /* Draw column hints */
        let hintCurX = 2 + rowHintsWidth + CELL_SIZE_PX / 2;
        for (let x = 0; x < this.nonogram.width; x++) {
            const hints = this.nonogram.colHints[x];
            let curY = colHintsHeight - 2;

            for (let i = 0; i < hints.length; i++) {
                const hint = hints[hints.length - i - 1];

                canvasCtx.textAlign = "center";
                canvasCtx.fillText(String(hint), hintCurX, curY);

                curY -= PX_PER_HINT;
            }

            hintCurX += CELL_SIZE_PX;
            hintCurX += (x % 5 == 4) ? 2 : 1;
        }

        return this.#view;
    }

    cleanup(): void {
        // Nothing to do
    }

    /**
     * Returns the element.
     */
    get view(): HTMLCanvasElement {
        if (!this.#view) {
            throw new Error("init() not called");
        }

        return this.#view;
    }

}