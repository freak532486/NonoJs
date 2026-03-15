import { NonogramBoardComponent } from "../../common/components/nonogram-board/nonogram-board.component";
import { CellKnowledge, NonogramState } from "../../common/types/nonogram-types";
import { NonogramColor, NonogramComponentState } from "./state";

export default class NonogramMouseControlsHandler {

    constructor(
        private readonly state: NonogramComponentState,
        private readonly board: NonogramBoardComponent
    )
    {
        board.view.onmousedown = ev => this.onMouseDown(ev);
        board.view.onmousemove = ev => this.onMouseMove(ev);
        board.view.onmouseup = ev => this.onMouseUp(ev);
        board.view.onwheel = ev => this.onMouseWheel(ev);
    }

    private onMouseDown(ev: MouseEvent)
    {
        const p = this.board.toCellCoordinates(ev.clientX, ev.clientY);
        if (p == undefined) {
            return;
        }

        /* On right click: Erase */
        if (ev.button == 2) {
            const curColor = this.state.activeState.getCell(p.x, p.y);
            if (curColor == CellKnowledge.UNKNOWN) {
                return;
            }

            const newState = NonogramState.clone(this.state.activeState);
            newState.updateCell(p.x, p.y, CellKnowledge.UNKNOWN);
            this.state.putNextState(newState);
            return;
        }

        if (this.state.lineStarted) {
            return;
        }

        this.state.cursorPos = p;
        this.state.startLine();
    }

    private onMouseUp(ev: MouseEvent) {
        if (ev.button !== 0) {
            return;
        }

        if (this.state.lineStarted) {
            this.state.finishLine();
        }
    }

    private onMouseMove(ev: MouseEvent) {
        const p = this.board.toCellCoordinates(ev.clientX, ev.clientY);
        if (p == undefined) {
            return;
        }

        /* On right click: Erase */
        if (ev.buttons == 2) {
            const curColor = this.state.activeState.getCell(p.x, p.y);
            if (curColor == CellKnowledge.UNKNOWN) {
                return;
            }

            const newState = NonogramState.clone(this.state.activeState);
            newState.updateCell(p.x, p.y, CellKnowledge.UNKNOWN);
            this.state.putNextState(newState);
            return;
        }

        if (!this.state.lineStarted) {
            this.state.cursorPos = p;
            return;
        }

        /* Snap to line alignment if line was started */
        const s = this.state.lineStartPosition!;
        const dx = Math.abs(s.x - p.x);
        const dy = Math.abs(s.y - p.y);

        if (dx < dy) {
            p.x = s.x;
        } else {
            p.y = s.y;
        }

        this.state.cursorPos = p;
    }

    private onMouseWheel(ev: MouseEvent) {
        ev.preventDefault();
        this.state.chosenColor = this.state.chosenColor == NonogramColor.BLACK ?
            NonogramColor.WHITE :
            NonogramColor.BLACK;
    }

}