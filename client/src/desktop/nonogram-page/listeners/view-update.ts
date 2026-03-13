import { BoardComponentFullState, NonogramBoardComponent } from "../../../common/components/nonogram-board/nonogram-board.component";
import { getTimeString } from "../../../common/services/playfield/timer-formatting";
import { NonogramComponentState, NonogramComponentStateListener, StateChangeType } from "../state"

export default class NonogramViewUpdater implements NonogramComponentStateListener {

    constructor(
        private readonly state: NonogramComponentState,
        private readonly board: NonogramBoardComponent,
        private readonly solverMsgSpan: HTMLElement,
        private readonly timerSpan: HTMLElement
    ) {
        this.onChange(StateChangeType.BOARD_STATE);
        this.onChange(StateChangeType.CHOSEN_COLOR);
        this.onChange(StateChangeType.CURSOR);
        this.onChange(StateChangeType.LINE_PREVIEW);
        this.onChange(StateChangeType.SOLVER_MSG);
        this.onChange(StateChangeType.TIMER);
    }

    onChange(type: StateChangeType): void {
        if (type == StateChangeType.LINE_PREVIEW) {
            this.onLinePreviewChanged();
        }

        if (type == StateChangeType.CURSOR) {
            this.board.selection = this.state.cursorPos;
        }

        if (type == StateChangeType.BOARD_STATE) {
            this.board.updateCells(this.state.activeState.cells);
            this.board.clearLineErrors();
            for (const line of this.state.errorLines) {
                this.board.markError(line, true);
            }

            for (const entry of this.state.crossedOutHints) {
                this.board.updateFinishedHints(entry[0], entry[1]);
            }
        }

        if (type == StateChangeType.SOLVER_MSG) {
            this.solverMsgSpan.textContent = this.state.solverMsg;
        }

        if (type == StateChangeType.TIMER) {
            this.timerSpan.textContent = getTimeString(this.state.elapsed);
        }
    }

    private onLinePreviewChanged() {
        if (!this.state.lineStarted) {
            this.board.clearLinePreview();
            return;
        }

        this.board.updateLinePreview(this.state.currentLinePoints, this.state.currentLineColor);
    }

}