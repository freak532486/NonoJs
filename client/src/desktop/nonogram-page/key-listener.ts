import { NonogramBoardComponent } from "../../common/components/nonogram-board/nonogram-board.component";
import { CellKnowledge } from "../../common/types/nonogram-types";
import { Point } from "../../common/types/point";
import NonogramController from "./controller";
import { NonogramColor, NonogramComponentState } from "./state";

export default class NonogramKeyboardListener
{

    constructor(
        private readonly state: NonogramComponentState
    ) {}

    onKeyDown(ev: KeyboardEvent) {
        ev.preventDefault();
        
        let curPos = this.state.cursorPos;
        if (curPos == undefined) {
            curPos = new Point(0, 0);
        }

        if (ev.key == "ArrowUp") {
            const yOff = (!ev.ctrlKey || curPos.y % 5 == 0) ? 1 : curPos.y % 5;
            const newPos = new Point(curPos.x, Math.max(0, curPos.y - yOff));
            this.state.cursorPos = new Point(newPos.x, newPos.y);
        }

        if (ev.key == "ArrowDown") {
            const yOff = (!ev.ctrlKey || curPos.y % 5 == 4) ? 1 : (4 - curPos.y % 5);
            const newPos = new Point(curPos.x, Math.min(this.state.nonogramHeight - 1, curPos.y + yOff));
            this.state.cursorPos = new Point(newPos.x, newPos.y);
        }

        if (ev.key == "ArrowLeft") {
            const xOff = (!ev.ctrlKey || curPos.x % 5 == 0) ? 1 : curPos.x % 5;
            const newPos = new Point(Math.max(0, curPos.x - xOff), curPos.y);
            this.state.cursorPos = new Point(newPos.x, newPos.y);
        }

        if (ev.key == "ArrowRight") {
            const xOff = (!ev.ctrlKey || curPos.x % 5 == 4) ? 1 : (4 - curPos.x % 5);
            const newPos = new Point(Math.min(this.state.nonogramWidth - 1, curPos.x + xOff), curPos.y);
            this.state.cursorPos = new Point(newPos.x, newPos.y);
        }

        if (ev.key == " ") {
            this.state.lineStarted ? this.state.finishLine() : this.state.startLine();
        }

        if (ev.key == "1") {
            this.state.chosenColor = NonogramColor.BLACK;
        }

        if (ev.key == "2") {
            this.state.chosenColor = NonogramColor.WHITE;
        }

        if (ev.ctrlKey && ev.key.toLowerCase() == "z") {
            this.state.undo();
        }

        if (ev.ctrlKey && ev.key.toLowerCase() == "y") {
            this.state.redo();
        }
    }

    onKeyUp(ev: KeyboardEvent) {
        // Nothing
    }

}