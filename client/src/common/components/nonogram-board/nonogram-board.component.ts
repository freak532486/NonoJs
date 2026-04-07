import { ListUtils } from "../../services/list-utils.js";
import { CellKnowledge, LineId, LineKnowledge, LineType } from "../../types/nonogram-types.js";
import { Point } from "../../types/point.js";
import UIComponent from "../../types/ui-component.js";

import "./nonogram-board.css"

const CELL_SIZE_PX = 16;

const COLOR_BADLINE = "#c27676ff"
const COLOR_SELECTION = "#aedbff"

export class BoardComponentFullState {

    constructor (
        public cells: Array<CellKnowledge>,
        public finishedRowHints: Array<Array<number>>,
        public finishedColHints: Array<Array<number>>,
        public errorLines: Array<LineId>
    ) {}

    /**
     * Creates an empty state
     */
    static empty(width: number, height: number) {
        return new BoardComponentFullState(
            Array(width * height).fill(CellKnowledge.UNKNOWN),
            Array(height).fill(null).map(() => []),
            Array(width).fill(null).map(() => []),
            []
        );
    }

    /**
     * Returns 'true' if this state is equal to some other state
     */
    equals(other: BoardComponentFullState): boolean {
        return deepArraysEqual(this.cells, other.cells) &&
            deepArraysEqual(this.finishedRowHints, other.finishedRowHints) &&
            deepArraysEqual(this.finishedColHints, other.finishedColHints) &&
            deepArraysEqual(this.errorLines, other.errorLines);
    }
}

export class NonogramBoardComponent implements UIComponent {

    #width: number;
    #height: number;

    #finishedRowHints: Array<Array<number>>;
    #finishedColHints: Array<Array<number>>;

    #rowHintDivs: Array<HTMLElement>;
    #colHintDivs: Array<HTMLElement>;
    #cellDivs: Array<HTMLElement>;

    #cellBlackTemplate: HTMLElement;
    #cellWhiteTemplate: HTMLElement; 

    #selection?: Point;
    #selectionDiv: HTMLElement = document.createElement("div");

    #view: HTMLElement

    #state: Array<CellKnowledge>;
    #errorLines: Array<LineId> = [];

    #imageThumbnail: HTMLCanvasElement;

    private previewColor: CellKnowledge = CellKnowledge.UNKNOWN;

    #clickListener: (ev: MouseEvent, p: Point) => void = () => {};

    constructor (
        public readonly rowHints: Array<Array<number>>, 
        public readonly colHints: Array<Array<number>>
    )
    {
        /* Copy data */
        const width = colHints.length;
        const height = rowHints.length;

        this.#width = width;
        this.#height = height;

        this.#finishedRowHints = Array(height).fill(null).map(() => []);
        this.#finishedColHints = Array(width).fill(null).map(() => []);

        this.#state = Array(width * height).fill(CellKnowledge.UNKNOWN);

        /* Create templates */
        this.#cellBlackTemplate = document.createElement("div");
        this.#cellBlackTemplate.classList.add("cell-black");

        this.#cellWhiteTemplate = document.createElement("span");
        this.#cellWhiteTemplate.classList.add("cell-white");
        this.#cellWhiteTemplate.textContent = "X";

        /* Create row hint divs */
        this.#rowHintDivs = [];
        for (let row = 0; row < height; row++) {
            /* Create hint container */
            const div = document.createElement("div");
            div.classList.add("hint-div-container", "row");

            div.style.borderTop = (row == 0) ? "2px solid black" : "none";
            div.style.borderBottom = (row % 5 == 4) ? "2px solid black" : "1px solid black";
            div.style.borderLeft = "2px solid black";

            /* Add hints to container. Empty hints should be displayed as a single zero. */
            const hintsWithZero = rowHints[row].length == 0 ? [0] : rowHints[row];
            for (const hint of hintsWithZero) {
                const hintDiv = document.createElement("div");
                hintDiv.classList.add("hint", "row");
                hintDiv.textContent = String(hint);

                div.appendChild(hintDiv);
            }

            this.#rowHintDivs.push(div);
        }

        /* Create column hint divs */
        this.#colHintDivs = [];
        for (let col = 0; col < width; col++) {
            /* Create hint container */
            const div = document.createElement("div");
            div.classList.add("hint-div-container", "column");

            div.style.borderLeft = (col == 0) ? "2px solid black" : "none";
            div.style.borderRight = (col % 5 == 4) ? "2px solid black" : "1px solid black";
            div.style.borderTop = "2px solid black";

            /* Add hints to container. Empty hints should be displayed as a single zero. */
            const hintsWithZero = colHints[col].length == 0 ? [0] : colHints[col];
            for (const hint of hintsWithZero) {
                const hintDiv = document.createElement("div");
                hintDiv.classList.add("hint", "column");
                hintDiv.textContent = String(hint);

                div.appendChild(hintDiv);
            }

            this.#colHintDivs.push(div);
        }

        /* Create cells */
        this.#cellDivs = [];
        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const div = document.createElement("div");
                div.classList.add("cell");

                div.style.borderLeft = (col == 0) ? "2px solid black" : "none";
                div.style.borderTop = (row == 0) ? "2px solid black" : "none";
                div.style.borderRight = (col % 5 == 4) ? "2px solid black" : "1px solid black";
                div.style.borderBottom = (row % 5 == 4) ? "2px solid black" : "1px solid black";

                div.oncontextmenu = () => false; // Disable context menu for right click
                div.onmousedown = ev => {
                    this.#clickListener(ev, new Point(col, row));
                };

                this.#cellDivs.push(div);
            }
        }

        /* Create canvas for image preview */
        this.#imageThumbnail = document.createElement("canvas");
        this.#imageThumbnail.classList.add("image-preview");
        this.#imageThumbnail.width = 0;
        this.#imageThumbnail.height = 0;


        /* Create selection element */
        this.#selectionDiv.classList.add("selection-cursor");

        /* Create root element */
        const view = document.createElement("div");
        view.id = "nonogram-board";
        view.style.gridTemplateRows = `max-content repeat(${height}, auto)`;
        view.style.gridTemplateColumns = `max-content repeat(${width}, auto)`;
    

        /* Layout and add children to root */
        for (let row = 0; row < height; row++) {
            const div = this.#rowHintDivs[row];

            div.style.gridRow = String(row + 2);
            div.style.gridColumn = "1";

            view.appendChild(div);
        }

        for (let col = 0; col < width; col++) {
            const div = this.#colHintDivs[col];

            div.style.gridRow = "1";
            div.style.gridColumn = String(col + 2);

            view.appendChild(div);
        }

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const div = this.#getCellDiv(col, row);

                div.style.gridRow = String(row + 2);
                div.style.gridColumn = String(col + 2);

                view.appendChild(div);
            }
        }

        view.appendChild(this.#imageThumbnail);
        view.appendChild(this.#selectionDiv);
        this.#view = view;
    }

    create(parent: HTMLElement): HTMLElement {
        parent.append(this.view);

        /* Need to update image preview because size can be calculated now */
        this.updateImagePreview();

        /* Move selection to top-left corner */
        this.selection = new Point(0, 0);
        return this.#view;
    }

    cleanup() {
        // Nothing to do
    }

    /**
     * Returns this components root element.
     */
    get view(): HTMLElement {
        return this.#view;
    }

    get width(): number {
        return this.#width;
    }

    get height(): number {
        return this.#height;
    }

    get selection(): Point | undefined {
        return this.#selection;
    }

    set selection(p: Point | undefined) {
        /* Nothing to do if nothing changes */
        if (p?.x == this.#selection?.x && p?.y == this.#selection?.y) {
            return;
        }

        /* Remove all cell color previews */
        this.view.querySelectorAll(".cell-color-preview").forEach(x => x.remove());

        if (p == undefined) {
            this.#selection = undefined;
            this.#selectionDiv.style.visibility = "hidden";
            this.#updateHintDivDisplay(false);
            return;
        }

        this.#selectionDiv.style.visibility = "visible";
        p.x = Math.max(0, Math.min(this.#width - 1, p.x));
        p.y = Math.max(0, Math.min(this.#height - 1, p.y));
        this.#selection = p;

        if (this.previewColor !== CellKnowledge.UNKNOWN) {
            const previewDiv = this.previewCellColor(p.x, p.y, this.previewColor);
            previewDiv.classList.add("cell-color-preview");
        }

        const cellDiv = this.#getCellDiv(p.x, p.y);

        const style = getComputedStyle(cellDiv);
        const borderLeft = parseFloat(style.borderLeftWidth) || 0;
        const borderTop = parseFloat(style.borderTopWidth) || 0;

        this.#selectionDiv.remove();
        cellDiv.appendChild(this.#selectionDiv);
        this.#selectionDiv.style.left = p.x == 0 ? "0px" : borderLeft + "px";
        this.#selectionDiv.style.top = p.y == 0 ? "0px" : borderTop + "px";
        
        /* Highlight hints */
        this.#updateHintDivDisplay();
    }

    /**
     * Moves the selection by the given offset. Does nothing if the selection is hidden.
     */
    moveSelection(dx: number, dy: number) {
        if (!this.selection) {
            return;
        }

        this.selection = new Point(this.selection.x + dx, this.selection.y + dy);
    }

    /**
     * Returns the cell div for the cell at the given location.
     */
    #getCellDiv(x: number, y: number): HTMLElement {
        return this.#cellDivs[x + y * this.#width];
    }

    /**
     * Returns the current state of a cell.
     */
    getCellState(x: number, y: number): CellKnowledge {
        return this.#state[x + y * this.#width];
    }

    /**
     * Sets the state of a cell.
     */
    setCellState(x: number, y: number, state: CellKnowledge, updateImagePreview: boolean = true) {
        if (this.getCellState(x, y) == state) {
            return;
        }

        this.#state[x + y * this.#width] = state;
        
        const div = this.#getCellDiv(x, y);
        div.querySelectorAll(".cell-state").forEach(x => x.remove());

        switch (state) {
            case CellKnowledge.UNKNOWN:
                break;

            case CellKnowledge.DEFINITELY_WHITE:
                const whiteCell = this.#cellWhiteTemplate.cloneNode(true) as HTMLElement;
                whiteCell.classList.add("cell-state");
                div.appendChild(whiteCell);
                break;

            case CellKnowledge.DEFINITELY_BLACK:
                const blackCell = this.#cellBlackTemplate.cloneNode(true) as HTMLElement;
                blackCell.classList.add("cell-state");
                div.appendChild(blackCell);
                break;
        }

        if (updateImagePreview) {
            this.updateImagePreview();
        }
    }

    /**
     * Switches the given cell to the "next" cell state.
     */
    toggleCellState(x: number, y: number) {
        const cur = this.getCellState(x, y);
        
        switch (cur) {
            case CellKnowledge.UNKNOWN:
                this.setCellState(x, y, CellKnowledge.DEFINITELY_BLACK);
                break;

            case CellKnowledge.DEFINITELY_BLACK:
                this.setCellState(x, y, CellKnowledge.DEFINITELY_WHITE);
                break;

            case CellKnowledge.DEFINITELY_WHITE:
                this.setCellState(x, y, CellKnowledge.UNKNOWN);
                break;
        }
    }

    updateCells(cells: Array<CellKnowledge>) {
        for (let y = 0; y < this.#height; y++) {
            for (let x = 0; x < this.#width; x++) {
                this.setCellState(x, y, cells[x + y * this.#width], false);
            }
        }

        this.updateImagePreview();
    }

    /**
     * Returns the full state of this board. Can be applied again later.
     */
    getFullState(): BoardComponentFullState {
        return new BoardComponentFullState(
            [...this.#state],
            this.#finishedRowHints.map(arr => [...arr]),
            this.#finishedColHints.map(arr => [...arr]),
            [...this.#errorLines]
        );
    }

    /**
     * Applies a full state to this board.
     */
    applyState(state: BoardComponentFullState) {
        /* Apply cell states */
        const cells = state.cells;

        if (cells.length != this.#width * this.#height) {
            throw new Error("State has unexpected length");
        }

        for (let i = 0; i < cells.length; i++) {
            const x = i % this.#width;
            const y = Math.floor(i / this.#width);

            this.setCellState(x, y, cells[i], false);
        }

        /* Apply finished row/column hints */
        if (state.finishedRowHints) {
            this.#finishedRowHints = state.finishedRowHints.map(arr => [...arr]);
        }

        if (state.finishedColHints) {
            this.#finishedColHints = state.finishedColHints.map(arr => [...arr]);
        }

        if (state.errorLines) {
            this.#errorLines = [...state.errorLines];
        }
        
        this.#updateHintDivDisplay();
        this.updateImagePreview();
    }

    /**
     * Sets the change listener that listens to any changes made to the board.
     */
    setClickListener(listener: (ev: MouseEvent, p: Point) => void) {
        this.#clickListener = listener;
    }

    /**
     * Clears the line preview.
     */
    clearLinePreview() {
        this.view.querySelectorAll(".line-preview").forEach(x => x.remove());
    }

    /**
     * Updates the preview for a line-to-be-drawn.
     */
    updateLinePreview(line: Array<Point>, lineType: CellKnowledge) {
        if (lineType == CellKnowledge.UNKNOWN) {
            this.clearLinePreview();
            return;
        }

        /* Remove previous preview */
        this.clearLinePreview();

        for (const p of line) {
            const previewDiv = this.previewCellColor(p.x, p.y, lineType);
            previewDiv.classList.add("line-preview");
        }
    }

    previewCellColor(
        x: number, y: number,
        color: CellKnowledge.DEFINITELY_BLACK | CellKnowledge.DEFINITELY_WHITE
    ): HTMLElement
    {
        const cellDiv = this.#getCellDiv(x, y);
        const cellDivStyle = getComputedStyle(cellDiv);
        const borderLeft = parseFloat(cellDivStyle.borderLeftWidth) || 0;
        const borderTop = parseFloat(cellDivStyle.borderTopWidth) || 0;

        
        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = x == 0 ? "0px" : borderLeft + "px";
        div.style.top = y == 0 ? "0px" : borderTop + "px";
        
        const template = color == CellKnowledge.DEFINITELY_BLACK ?
            this.#cellBlackTemplate :
            this.#cellWhiteTemplate;
        const child = template.cloneNode(true) as HTMLElement;
        div.replaceChildren(child);
        cellDiv.appendChild(div);

        return div;
    }

    /**
     * Updates the set of finished hints for a line.
     */
    updateFinishedHints(lineId: LineId, finishedHints: Array<number>) {
        const member = lineId.lineType == LineType.ROW ?
            this.#finishedRowHints :
            this.#finishedColHints;

        member[lineId.index] = finishedHints;
        this.#updateHintDivDisplay();
    }

    /**
     * Returns the current state of a given line.
     */
    getLineState(lineId: LineId): LineKnowledge {
        const lineLength = lineId.lineType == LineType.ROW ? this.width : this.height;
        const lineKnowledge = new LineKnowledge(Array(lineLength).fill(CellKnowledge.UNKNOWN));
        
        for (let i = 0; i < lineLength; i++) {
            const x = lineId.lineType == LineType.ROW ? i : lineId.index;
            const y = lineId.lineType == LineType.ROW ? lineId.index : i;

            lineKnowledge.cells[i] = this.getCellState(x, y);
        }

        return lineKnowledge;
    }

    /**
     * Marks a line either erroneous or not.
     */
    markError(lineId: LineId, isError: boolean) {
        ListUtils.removeIf(this.#errorLines, x => x.equals(lineId));
        if (isError) {
            this.#errorLines.push(lineId);
        }

        this.#updateHintDivDisplay(false);
    }

    clearLineErrors() {
        for (let x = 0; x < this.width; x++) {
            this.markError(LineId.column(x), false);
        }

        for (let y = 0; y < this.height; y++) {
            this.markError(LineId.row(y), false);
        }
    }

    /**
     * Marks error lines red, the selected line blue, and all other lines white. Crosses out finished hints.
     */
    #updateHintDivDisplay(updateCrossedOutHints: boolean = true) {
        /* Rows */
        const errRows: Set<number> = new Set();
        this.#errorLines.filter(x => x.lineType == LineType.ROW).forEach(x => errRows.add(x.index));

        for (let y = 0; y < this.#height; y++) {
            const div = this.#rowHintDivs[y];

            /* Coloring */
            if (errRows.has(y)) {
                div.style.backgroundColor = COLOR_BADLINE;
            } else if (this.#selection !== undefined && y == this.#selection.y) {
                div.style.backgroundColor = COLOR_SELECTION;
            } else {
                div.style.backgroundColor = "transparent";
            }

            /* Cross out finished hints */
            if (updateCrossedOutHints) {
                for (let i = 0; i < div.children.length; i++) {
                    const child = div.children[i] as HTMLElement;
                    child.classList.remove("crossed-out");
                }

                for (const hintIdx of this.#finishedRowHints[y]) {
                    const child = div.children[hintIdx] as HTMLElement;
                    child.classList.add("crossed-out");
                }
            }
        }

        /* Columns */
        const errCols = /** @type {Set<number>} */ (new Set());
        this.#errorLines.filter(x => x.lineType == LineType.COLUMN).forEach(x => errCols.add(x.index));

        for (let x = 0; x < this.#width; x++) {
            const div = this.#colHintDivs[x];

            /* Coloring */
            if (errCols.has(x)) {
                div.style.backgroundColor = COLOR_BADLINE;
            } else if (this.#selection !== undefined && x == this.#selection.x) {
                div.style.backgroundColor = COLOR_SELECTION;
            }  else {
                div.style.backgroundColor = "transparent";
            }

            /* Cross out finished hints */
            if (updateCrossedOutHints) {
                for (let i = 0; i < div.children.length; i++) {
                    const child = div.children[i] as HTMLElement;
                    child.classList.remove("crossed-out");
                }

                for (const hintIdx of this.#finishedColHints[x]) {
                    const child = div.children[hintIdx] as HTMLElement;
                    child.classList.add("crossed-out");
                }
            }
        }
    }

    /**
     * Applies the given line knowledge to the given line in the state.
     */
    applyLineKnowledge(lineId: LineId, lineKnowledge: LineKnowledge) {
        const lineLength = lineId.lineType == LineType.ROW ? this.width : this.height;
        for (let i = 0; i < lineLength; i++) {
            const x = lineId.lineType == LineType.ROW ? i : lineId.index;
            const y = lineId.lineType == LineType.ROW ? lineId.index : i;

            this.setCellState(x, y, lineKnowledge.cells[i]);
        }
    }

    /**
     * Returns cell coordinates that match the given offset coordinates (relative to this.view).
     */
    toCellCoordinates(clientX: number, clientY: number): Point | undefined {
        const topLeftCellRect = this.#getCellDiv(0, 0).getBoundingClientRect();

        const dx = clientX - topLeftCellRect.left;
        const dy = clientY - topLeftCellRect.top;

        if (dx < 0 || dy < 0) {
            return undefined;
        }

        const xHi = Math.floor(dx / CELL_SIZE_PX);
        const xLo = Math.floor(dx / (CELL_SIZE_PX + 4));
        const yHi = Math.floor(dy / CELL_SIZE_PX);
        const yLo = Math.floor(dy / (CELL_SIZE_PX + 4));
        
        let x: number | undefined = undefined;
        for (let cx = xLo; cx <= xHi; cx++) {
            if (cx >= this.width) {
                return undefined;
            }

            const cellRect = this.#getCellDiv(cx, 0).getBoundingClientRect();
            if (cellRect.left <= clientX && cellRect.right > clientX) {
                x = cx;
                break;
            }
        }

        let y: number | undefined = undefined;
        for (let cy = yLo; cy <= yHi; cy++) {
            if (cy >= this.height) {
                return undefined;
            }

            const cellRect = this.#getCellDiv(0, cy).getBoundingClientRect();
            if (cellRect.top <= clientY && cellRect.bottom > clientY) {
                y = cy;
                break;
            }
        }

        return new Point(x, y);
    }

    get errorLines() {
        return this.#errorLines;
    }

    set lineColorPreview(color: CellKnowledge) {
        if (color == this.previewColor) {
            return;
        }

        this.previewColor = color;
        this.view.querySelectorAll(".cell-color-preview").forEach(x => x.remove());
        if (this.selection !== undefined && color !== CellKnowledge.UNKNOWN) {
            const previewDiv = this.previewCellColor(this.selection.x, this.selection.y, color);
            previewDiv.classList.add("cell-color-preview");
        }

    }

    private updateImagePreview()
    {
        /* Determine actual canvas size */
        const rect = this.#imageThumbnail.getBoundingClientRect();
        const width = this.#imageThumbnail.offsetWidth;
        const height = this.#imageThumbnail.offsetHeight;

        this.#imageThumbnail.width = width;
        this.#imageThumbnail.height = height;

        /* Calculate drawing bounds */
        const imageAspect = this.width / this.height;
        const canvasAspect = width / height;

        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;

        if (canvasAspect > imageAspect) {
            const thumbnailWidth = height * imageAspect;

            minX = (width - thumbnailWidth) / 2;
            maxX = (width + thumbnailWidth) / 2;
            minY = 0;
            maxY = height;
        } else {
            const thumbnailHeight = width / imageAspect;

            minX = 0;
            maxX = width;
            minY = (height - thumbnailHeight) / 2;
            maxY = (height + thumbnailHeight) / 2;
        }

        /* Draw each square */
        const squareWidth = (maxX - minX) / this.width;
        const squareHeight = (maxY - minY) / this.height;
        const ctx = this.#imageThumbnail.getContext("2d")!;
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const cell = this.getCellState(x, y);

                ctx.fillStyle = cell == CellKnowledge.DEFINITELY_BLACK ? "black" : "white";
                ctx.fillRect(
                    Math.floor(minX + x * squareWidth),
                    Math.floor(minY + y * squareHeight),
                    Math.ceil(squareWidth),
                    Math.ceil(squareHeight)
                );
            }
        }
    }

};

/**
 * Returns 'true' iff the contents of the two arrays are equal.
 */
function deepArraysEqual(arr1: Array<any>, arr2: Array<any>) {
    if (arr1.length != arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        const val1 = arr1[i];
        const val2 = arr2[i];

        if (Array.isArray(val1) && Array.isArray(val2)) {
            if (!deepArraysEqual(val1, val2)) {
                return false;
            }
        } else if (Object.hasOwn(val1, "equals") && !val1.equals(val2)) {
            return false;
        } else if (val1 !== val2) {
            return false;
        }
    }

    return true;
}