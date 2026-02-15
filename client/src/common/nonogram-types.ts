/**
 * Type of a line
 */
export enum LineType {
    ROW, COLUMN
};

/**
 * Identifier for a line
 */
export class LineId {
    /**
     * @param {!LineType} lineType 
     * @param {number} index 
     */
    constructor (
        public readonly lineType: LineType,
        public readonly index: number
    )
    {}

    static row(y: number) {
        return new LineId(LineType.ROW, y);
    }

    static column(x: number) {
        return new LineId(LineType.COLUMN, x);
    }

    toString(): string {
        // One-indexed for human readability
        return `${this.lineType == LineType.ROW ? "row" : "column"} ${this.index + 1}`;
    }

    equals(other: LineId): boolean {
        return this.index == other.index && this.lineType == other.lineType;
    }
};

/**
 * Current knowledge about a nonogram cell.
 * @enum {number}
 */
export enum CellKnowledge {
    UNKNOWN, DEFINITELY_WHITE, DEFINITELY_BLACK
};

/**
 * Knowledge data for a single line.
 */
export class LineKnowledge {
    constructor (
        public readonly cells: Array<CellKnowledge>
    ) {}

    toString(): string {
        let ret = "";
        for (const cellKnowledge of this.cells) {
            switch (cellKnowledge) {
                case CellKnowledge.DEFINITELY_BLACK: ret += "#"; break;
                case CellKnowledge.DEFINITELY_WHITE: ret += " "; break;
                case CellKnowledge.UNKNOWN: ret += "?"; break;
            }
        }
        return ret;
    }
}

export class NonogramState {
    readonly width: number;
    readonly height: number;

    /**
     * Creates an empty board.
     */
    constructor (
        public readonly rowHints: Array<Array<number>>,
        public readonly colHints: Array<Array<number>>,
        public readonly cells: Array<CellKnowledge>
    )
    {
        this.width = colHints.length;
        this.height = rowHints.length;
    }

    /**
     * Creates an empty nonogram board state.
     */
    static empty(rowHints: Array<Array<number>>, colHints: Array<Array<number>>): NonogramState {
        const width = colHints.length;
        const height = rowHints.length;
        const cells = Array(width * height).fill(CellKnowledge.UNKNOWN);
        return new NonogramState(rowHints, colHints, cells);
    }

    /**
     * Clones an existing nonogram board state.
     */
    static clone(state: NonogramState): NonogramState {
        return new NonogramState(state.rowHints, state.colHints, [...state.cells]);
    }

    /**
     * Returns the hints for the given line id.
     */
    getLineHints(lineId: LineId): Array<number> {
        return lineId.lineType == LineType.ROW ?
            this.rowHints[lineId.index] :
            this.colHints[lineId.index];
    }

    /**
     * Returns the knowledge of the cell at the given location.
     */
    getCell(x: number, y: number): CellKnowledge {
        return this.cells[x + y * this.width];
    }

    /**
     * Updates the knowledge state of a cell.
     */
    updateCell(x: number, y: number, knowledge: CellKnowledge) {
        this.cells[x + y * this.width] = knowledge;
    }

    /**
     * Returns the line knowledge for the requested line.
     */
    getLineKnowledge(lineId: LineId): LineKnowledge {
        return lineId.lineType == LineType.ROW ?
            this.getRowKnowledge(lineId.index) :
            this.getColKnowledge(lineId.index);
    }

    /**
     * Returns the line knowledge for the requested row.
     */
    getRowKnowledge(row: number): LineKnowledge {
        if (row < 0 || row >= this.height) {
            throw new Error("Row " + row + " does not exist.");
        }

        const cells = Array(this.width);
        for (let x = 0; x < this.width; x++) {
            cells[x] = this.getCell(x, row);
        }

        return new LineKnowledge(cells);
    }

    /**
     * Returns the line knowledge for the requested column.
     */
    getColKnowledge(col: number): LineKnowledge {
        if (col < 0 || col >= this.width) {
            throw new Error("Column " + col + " does not exist.");
        }

        const cells = Array(this.height);
        for (let y = 0; y < this.height; y++) {
            cells[y] = this.getCell(col, y);
        }

        return new LineKnowledge(cells);
    }

    /**
     * Applies a deduction to this state.
     */
    applyDeduction(deduction: SingleDeductionResult) {
        if (deduction.status != DeductionStatus.DEDUCTION_MADE) {
            return;
        }

        if (deduction.lineId!.lineType == LineType.ROW) {
            for (let x = 0; x < this.width; x++) {
                this.updateCell(x, deduction.lineId!.index, deduction.newKnowledge!.cells[x]);
            }
        } else {
            for (let y = 0; y < this.height; y++) {
                this.updateCell(deduction.lineId!.index, y, deduction.newKnowledge!.cells[y]);
            }
        }
    }
};

/**
 * Flags for deduction result.
 * @enum {number}
 */
export enum DeductionStatus {
    COULD_NOT_DEDUCE,
    DEDUCTION_MADE,
    WAS_IMPOSSIBLE,
    WAS_SOLVED,
    TIMEOUT
}

export class FullDeductionResult {

    constructor (
        public readonly status: DeductionStatus,
        public readonly newState: NonogramState
    ) {}
}


export class SingleDeductionResult {

    constructor (
        public readonly status: DeductionStatus,
        public readonly lineId: LineId | undefined,
        public readonly newKnowledge: LineKnowledge | undefined
    )
    {
        const hasLineId = lineId !== undefined;
        const hasKnowledge = newKnowledge !== undefined;

        if (hasLineId !== hasKnowledge) {
            throw new Error("Either both are supplied or none");
        }
    }

    /**
     * Creates a "nothing was deduced" deduction result.
     */
    static noDeduction(): SingleDeductionResult {
        return new SingleDeductionResult(DeductionStatus.COULD_NOT_DEDUCE, undefined, undefined);
    }

    /**
     * Creates a "state was impossible" deduction result.
     */
    static impossible(): SingleDeductionResult {
        return new SingleDeductionResult(DeductionStatus.WAS_IMPOSSIBLE, undefined, undefined);
    }

}