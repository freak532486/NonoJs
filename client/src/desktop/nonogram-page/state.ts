import { PlayfieldLineHandler } from "../../common/services/playfield/playfield-line-handler";
import { CellKnowledge, NonogramState } from "../../common/types/nonogram-types";
import { Point } from "../../common/types/point";

export enum StateChangeType {
    BOARD_STATE,
    CHOSEN_COLOR,
    CURSOR,
    LINE_PREVIEW
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

export class NonogramComponentState
{
    private _chosenColor: NonogramColor = NonogramColor.BLACK;

    private _history: Array<NonogramState>;
    private _historyIdx: number = 0;

    private _lineHandler: PlayfieldLineHandler = new PlayfieldLineHandler();
    private _cursor: Point = new Point(0, 0);

    /**
     * List of listeners. Will be notified on any state change.
     */
    public readonly listeners: Array<NonogramComponentStateListener> = [];

    constructor(
        public readonly rowHints: Array<Array<number>>,
        public readonly colHints: Array<Array<number>>)
    {
        this._history = [NonogramState.empty(rowHints, colHints)];
    }

    get nonogramWidth(): number {
        return this.colHints.length;
    }

    get nonogramHeight(): number {
        return this.rowHints.length;
    }

    get activeState(): NonogramState {
        return this._history[this._historyIdx];
    }

    get history(): Array<NonogramState> {
        return this._history;
    }

    get historyIdx(): number {
        return this._historyIdx;
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

    get cursorPos(): Point {
        return this._cursor;
    }

    undo() {
        if (this.historyIdx == 0) {
            return;
        }

        this._historyIdx -= 1;
        this.notifyListeners(StateChangeType.BOARD_STATE);
    }

    redo() {
        if (this.historyIdx == this.history.length - 1) {
            return;
        }

        this._historyIdx += 1;
        this.notifyListeners(StateChangeType.BOARD_STATE);
    }

    putNextState(state: NonogramState) {
        while (this._history.length > this._historyIdx + 1) {
            this._history.pop();
        }

        this._history.push(state);
        this._historyIdx = this._history.length - 1;
        this.notifyListeners(StateChangeType.BOARD_STATE);
    }

    get lineStarted(): boolean {
        return this._lineHandler.lineStarted();
    }

    startLine()
    {
        if (this._lineHandler.lineStarted()) {
            this._lineHandler.clearLine();
        }

        const lineColor = this._chosenColor == NonogramColor.BLACK ?
            CellKnowledge.DEFINITELY_BLACK :
            CellKnowledge.DEFINITELY_WHITE;

        this._lineHandler.startLine(this.cursorPos, lineColor);
        this.notifyListeners(StateChangeType.LINE_PREVIEW);
    }

    set cursorPos(p: Point) {
        this._cursor = p;
        this.notifyListeners(StateChangeType.CURSOR);

        if (this._lineHandler.lineStarted()) {
            if (this._lineHandler.setEndPosition(p)) {
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

    private notifyListeners(type: StateChangeType) {
        for (const listener of this.listeners) {
            listener.onChange(type);
        }
    }

}