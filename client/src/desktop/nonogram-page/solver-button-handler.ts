import { deduceAll, deduceNext } from "../../common/services/solver/solver";
import { DeductionStatus, NonogramState, SingleDeductionResult } from "../../common/types/nonogram-types";
import { NonogramComponentState } from "./state";

export default class SolverButtonHandler
{

    constructor(
        private readonly state: NonogramComponentState
    ) {}

    hint() {
        const deduction = deduceNext(this.state.activeState);

        if (deduction.status !== DeductionStatus.DEDUCTION_MADE) {
            this.state.solverMsg = getMessageText(deduction.status);
        } else {
            this.state.solverMsg = "You can make a deduction in " + deduction.lineId + ".";
        }
    }

    solveNext() {
        const deduction = deduceNext(this.state.activeState);

        if (deduction.status == DeductionStatus.DEDUCTION_MADE) {
            const newState = NonogramState.clone(this.state.activeState);
            newState.applyDeduction(deduction);
            this.state.putNextState(newState);
        }

        this.state.solverMsg = getMessageText(deduction.status);
    }

    solve() {
        const deduction = deduceAll(this.state.activeState);
        if (deduction.status == DeductionStatus.WAS_SOLVED) {
            this.state.isSolved = true;
        }
        
        this.state.putNextState(deduction.newState);
        this.state.solverMsg = getMessageText(deduction.status);
    }

}

function getMessageText(status: DeductionStatus) {
    if (status == DeductionStatus.WAS_IMPOSSIBLE) {
        return "Puzzle is impossible or has an error.";
    }

    if (status == DeductionStatus.COULD_NOT_DEDUCE || status == DeductionStatus.TIMEOUT) {
        return "Solver could not perform a deduction.";
    }

    if (status == DeductionStatus.WAS_SOLVED) {
        return "Puzzle is solved.";
    }

    return "A deduction was made.";
}