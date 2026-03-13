import { getTimeString } from "../../common/services/playfield/timer-formatting";
import { isSolved } from "../../common/services/solver/solver";
import { NonogramComponentState, NonogramComponentStateListener, StateChangeType } from "./state";

export default class SolvedListener implements NonogramComponentStateListener
{
    constructor(
        private readonly state: NonogramComponentState
    ) {}

    onChange(type: StateChangeType): void {
        if (type !== StateChangeType.BOARD_STATE) {
            return;
        }

        if (isSolved(this.state.activeState)) {
            if (!this.state.solvedBySolver) {
                window.alert("Congratulations! You solved the puzzle in " + getTimeString(this.state.elapsed) + ".");
            }

            this.state.timerRunning = false;
        }

    }
    
}