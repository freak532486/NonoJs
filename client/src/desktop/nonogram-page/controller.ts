import { NonogramBoardComponent } from "../../common/components/nonogram-board/nonogram-board.component";
import { PlayfieldLineHandler } from "../../common/services/playfield/playfield-line-handler";
import { CellKnowledge } from "../../common/types/nonogram-types";
import { Point } from "../../common/types/point";

export default class NonogramController
{

    private readonly lineHandler: PlayfieldLineHandler;

    constructor(
        public readonly board: NonogramBoardComponent
    )
    {
        this.lineHandler = new PlayfieldLineHandler();
    }

    /**
     * Either starts a new line, or finishes the existing one.
     */
    toggleLine()
    {
        const pos = this.board.selection;
        if (pos == undefined) {
            this.lineHandler.clearLine();
            return;
        }

        if (this.lineHandler.lineStarted()) {
            const line = this.lineHandler.getCurrentLine();
            for (const p of line.points) {
                this.board.setCellState(p.x, p.y, line.type);
            }
            
            this.lineHandler.clearLine();
            this.board.clearLinePreview();
            return;
        }

        this.lineHandler.startLine(new Point(pos.x, pos.y), CellKnowledge.DEFINITELY_BLACK);
        const curLine = this.lineHandler.getCurrentLine();
        this.board.updateLinePreview(curLine.points, curLine.type);
    }

    /**
     * Moves the playfield cursor to the given position.
     */
    moveCursor(x: number, y: number)
    {
        x = Math.max(0, Math.min(this.board.width - 1, x));
        y = Math.max(0, Math.min(this.board.height - 1, y));

        if (this.lineHandler.lineStarted()) {
            if (this.lineHandler.setEndPosition(new Point(x, y))) {
                this.lineHandler.clearLine();
            }

            const curLine = this.lineHandler.getCurrentLine();
            this.board.updateLinePreview(curLine.points, curLine.type);
        }

        this.board.selection = new Point(x, y);
    }



};