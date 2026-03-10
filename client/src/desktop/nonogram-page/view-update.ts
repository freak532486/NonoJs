import { BoardComponentFullState, NonogramBoardComponent } from "../../common/components/nonogram-board/nonogram-board.component";
import { NonogramComponentState, NonogramComponentStateListener, StateChangeType } from "./state"

export default class NonogramViewUpdater implements NonogramComponentStateListener {

    constructor(
        private readonly state: NonogramComponentState,
        private readonly board: NonogramBoardComponent
    ) {}

    onChange(type: StateChangeType): void {
        if (type == StateChangeType.LINE_PREVIEW) {
            this.onLinePreviewChanged();
            return;
        }

        if (type == StateChangeType.CURSOR) {
            this.board.selection = this.state.cursorPos;
            return;
        }

        if (type == StateChangeType.BOARD_STATE) {
            this.board.updateCells(this.state.activeState.cells);
            return;
        }

        if (type == StateChangeType.ERROR_LINES) {
            this.board.clearLineErrors();
            for (const line of this.state.errorLines) {
                this.board.markError(line, true);
            }
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