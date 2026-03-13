import { PlayfieldLineHandler } from "../../common/services/playfield/playfield-line-handler";
import { checkHints, deduceAll, statesAreCompatible } from "../../common/services/solver/solver";
import LineIdSet from "../../common/types/line-id-set";
import { CellKnowledge, LineId, LineType, NonogramState } from "../../common/types/nonogram-types";
import { Point } from "../../common/types/point";

export enum StateChangeType {
    BOARD_STATE,
    CHOSEN_COLOR,
    CURSOR,
    LINE_PREVIEW,
    SOLVER_MSG
};

export interface NonogramComponentStateListener
{
    /**
     * Is called, when a change of the given type occurs.
     */
    onChange(type: StateChangeType): void;
};

export enum NonogramColor {
    BLACK, WHITE
};

export interface HistoryEntry {
    state: NonogramState,
    errorLines: Array<LineId>,
    crossedOutHints: Map<LineId, Array<number>>
}

export class NonogramComponentState
{
    private _solution: NonogramState;

    private _chosenColor: NonogramColor = NonogramColor.BLACK;

    private _history: Array<HistoryEntry>;
    private _historyIdx: number = 0;
    private _validHistoryIdx: number = 0;

    private _lineHandler: PlayfieldLineHandler = new PlayfieldLineHandler();
    private _cursor?: Point;

    private _solverMsg: string = "";

    /**
     * List of listeners. Will be notified on any state change.
     */
    public readonly listeners: Array<NonogramComponentStateListener> = [];

    constructor(
        public readonly rowHints: Array<Array<number>>,
        public readonly colHints: Array<Array<number>>
    )
    {
        const initialState: HistoryEntry = {
            state: NonogramState.empty(rowHints, colHints),
            errorLines: [],
            crossedOutHints: new Map()
        };

        for (let x = 0; x < this.nonogramWidth; x++) {
            initialState.crossedOutHints.set(LineId.column(x), []);
        }

        for (let y = 0; y < this.nonogramHeight; y++) {
            initialState.crossedOutHints.set(LineId.row(y), []);
        }

        this._history = [initialState];
        this._solution = deduceAll(initialState.state).newState;
    }

    get nonogramWidth(): number {
        return this.colHints.length;
    }

    get nonogramHeight(): number {
        return this.rowHints.length;
    }

    get activeState(): NonogramState {
        return this._history[this._historyIdx].state;
    }

    get history(): Array<HistoryEntry> {
        return this._history;
    }

    get historyIdx(): number {
        return this._historyIdx;
    }

    get lastValidHistoryIdx(): number {
        return this._validHistoryIdx;
    }

    get chosenColor(): NonogramColor {
        return this._chosenColor;
    }

    set chosenColor(color: NonogramColor) {
        if (color == this._chosenColor) {
            return;
        }

        if (this._lineHandler.clearLine()) {
            this.notifyListeners(StateChangeType.LINE_PREVIEW);
        }

        this._chosenColor = color;
        this.notifyListeners(StateChangeType.CHOSEN_COLOR);
    }

    get currentLinePoints(): Array<Point> {
        return this._lineHandler.getCurrentLine().points;
    }

    get currentLineColor(): CellKnowledge {
        return this._lineHandler.getCurrentLine().type;
    }

    get cursorPos(): Point | undefined {
        return this._cursor;
    }

    undo() {
        this.historyIdx = this.historyIdx - 1;
    }

    redo() {
        this.historyIdx = this.historyIdx + 1;
    }

    set historyIdx(idx: number) {
        if (idx == this._historyIdx || idx < 0 || idx >= this._history.length) {
            return;
        }

        this._historyIdx = idx;
        this.notifyListeners(StateChangeType.BOARD_STATE);
    }

    putNextState(state: NonogramState) {
        while (this._history.length > this._historyIdx + 1) {
            this._history.pop();
        }

        const hintDeduction = this.performHintDeduction(state);
        const errLines = hintDeduction.errorLines;
        const crossedOutHints = mergeMaps(hintDeduction.newFinishedHints, this.crossedOutHints);
        const isCorrect = statesAreCompatible(state, this._solution);

        this._history.push({ state: state, errorLines: errLines, crossedOutHints: crossedOutHints });
        this._historyIdx = this._history.length - 1;
        this._validHistoryIdx = isCorrect ? this._historyIdx : this._validHistoryIdx;
        this.solverMsg = "";
        this.notifyListeners(StateChangeType.BOARD_STATE);
    }

    private performHintDeduction(newState: NonogramState): HintDeductionResult {
        const errLines: Array<LineId> = [];
        const crossedOutHints: Map<LineId, Array<number>> = new Map();

        /* Deduce over changed lines over and over again */
        const queue = calcChangedLines(this.activeState, newState).asArray();

        const deducedState = new NonogramState(newState.rowHints, newState.colHints, [...newState.cells]);
        while (queue.length > 0) {
            /* Pop a line from the queue */
            const line = queue.pop()!;
            const lineLength = line.lineType == LineType.ROW ? newState.width : newState.height;

            const lineKnowledge = deducedState.getLineKnowledge(line);
            const hints = deducedState.getLineHints(line);

            /* Perform deduction */
            const deduction = checkHints(lineKnowledge, hints);
            if (deduction == undefined) {
                errLines.push(line);
                continue;
            }

            /* Update deduced state, push changed orthogonal lines into queue */
            crossedOutHints.set(line, deduction.finishedHints);
            for (let i = 0; i < lineLength; i++) {
                const oldCell = lineKnowledge.cells[i];
                const newCell = deduction.newKnowledge.cells[i];

                if (oldCell == newCell) {
                    continue;
                }

                if (line.lineType == LineType.ROW) {
                    queue.push(LineId.column(i));
                    deducedState.updateCell(i, line.index, newCell);
                } else {
                    queue.push(LineId.row(i));
                    deducedState.updateCell(line.index, i, newCell);
                }
            }
        }

        /* Replace old cells with new cells */
        for (let i = 0; i < newState.cells.length; i++) {
            newState.cells[i] = deducedState.cells[i];
        }

        return {
            errorLines: errLines,
            newFinishedHints: crossedOutHints
        };
    }

    get lineStarted(): boolean {
        return this._lineHandler.lineStarted();
    }

    get lineStartPosition(): Point | undefined {
        return this._lineHandler.startPosition;
    }

    startLine()
    {
        if (this.cursorPos == undefined) {
            return;
        }

        if (this._lineHandler.lineStarted()) {
            this._lineHandler.clearLine();
        }

        const lineColor = this._chosenColor == NonogramColor.BLACK ?
            CellKnowledge.DEFINITELY_BLACK :
            CellKnowledge.DEFINITELY_WHITE;

        this._lineHandler.startLine(this.cursorPos, lineColor);
        this.notifyListeners(StateChangeType.LINE_PREVIEW);
    }

    set cursorPos(p: Point | undefined) {
        this._cursor = p;
        this.notifyListeners(StateChangeType.CURSOR);

        if (this._lineHandler.lineStarted()) {
            if (p == undefined || this._lineHandler.setEndPosition(p)) {
                this._lineHandler.clearLine();
            }

            this.notifyListeners(StateChangeType.LINE_PREVIEW);
        }
    }

    finishLine()
    {
        if (!this._lineHandler.lineStarted()) {
            return;
        }

        const line = this._lineHandler.getCurrentLine();
        const newState = new NonogramState(this.rowHints, this.colHints, [...this.activeState.cells]);
        for (const p of line.points) {
            newState.updateCell(p.x, p.y, line.type);
        }

        this.putNextState(newState);

        this._lineHandler.clearLine();
        this.notifyListeners(StateChangeType.LINE_PREVIEW);
    }

    reset() {
        this._chosenColor = NonogramColor.BLACK;
        
        this._history = [this._history[0]];
        this._historyIdx = 0;
        this._validHistoryIdx = 0;

        this._lineHandler.clearLine();
        this._cursor = undefined;

        this._solverMsg = "";

        this.notifyListeners(StateChangeType.BOARD_STATE);
        this.notifyListeners(StateChangeType.CHOSEN_COLOR);
        this.notifyListeners(StateChangeType.CURSOR);
        this.notifyListeners(StateChangeType.LINE_PREVIEW);
        this.notifyListeners(StateChangeType.SOLVER_MSG);
    }

    get errorLines(){
        return this._history[this._historyIdx].errorLines;
    }

    get crossedOutHints() {
        return this._history[this._historyIdx].crossedOutHints;
    }

    get solverMsg() {
        return this._solverMsg;
    }

    set solverMsg(msg: string) {
        this._solverMsg = msg;
        this.notifyListeners(StateChangeType.SOLVER_MSG);
    }

    private notifyListeners(type: StateChangeType) {
        for (const listener of this.listeners) {
            listener.onChange(type);
        }
    }
}

interface HintDeductionResult {
    errorLines: Array<LineId>,
    newFinishedHints: Map<LineId, Array<number>>
};


/**
 * Calculates which lines have changed between the two states.
 */
function calcChangedLines(
    oldState: NonogramState,
    newState: NonogramState
): LineIdSet
{
    const ret = new LineIdSet();

    for (let y = 0; y < oldState.height; y++) {
        for (let x = 0; x < oldState.width; x++) {
            if (oldState.getCell(x, y) !== newState.getCell(x, y)) {
                ret.add(new LineId(LineType.ROW, y));
                ret.add(new LineId(LineType.COLUMN, x));
            }
        }
    }

    return ret;
}

/**
 * Merges the two given maps. On conflict, a wins.
 */
function mergeMaps<K, V>(a: Map<K, V>, b: Map<K, V>) {
    const ret = new Map(b);
    for (const entry of a) {
        ret.set(entry[0], entry[1]);
    }
    return ret;
}