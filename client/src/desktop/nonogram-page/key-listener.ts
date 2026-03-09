import { NonogramBoardComponent } from "../../common/components/nonogram-board/nonogram-board.component";
import { Point } from "../../common/types/point";

export default class NonogramKeyboardListener
{

    constructor(
        private readonly nonogramBoard: NonogramBoardComponent
    ) {}

    onKeyDown(ev: KeyboardEvent) {
        const curPos = this.nonogramBoard.selection;

        if (ev.key == "ArrowUp") {
            const yOff = (!ev.ctrlKey || curPos.y % 5 == 0) ? 1 : curPos.y % 5;
            this.nonogramBoard.selection = new Point(curPos.x, Math.max(0, curPos.y - yOff));
        }

        if (ev.key == "ArrowDown") {
            const yOff = (!ev.ctrlKey || curPos.y % 5 == 4) ? 1 : (4 - curPos.y % 5);
            this.nonogramBoard.selection = new Point(curPos.x, Math.min(this.nonogramBoard.height - 1, curPos.y + yOff));
        }

        if (ev.key == "ArrowLeft") {
            const xOff = (!ev.ctrlKey || curPos.x % 5 == 0) ? 1 : curPos.x % 5;
            this.nonogramBoard.selection = new Point(Math.max(0, curPos.x - xOff), curPos.y);
        }

        if (ev.key == "ArrowRight") {
            const xOff = (!ev.ctrlKey || curPos.x % 5 == 4) ? 1 : (4 - curPos.x % 5);
            this.nonogramBoard.selection = new Point(Math.min(this.nonogramBoard.width - 1, curPos.x + xOff), curPos.y);
        }
    }

    onKeyUp(ev: KeyboardEvent) {
        // TODO
    }

}