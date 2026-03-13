import { NonogramColor, NonogramComponentState, NonogramComponentStateListener, StateChangeType } from "../state";

export default class NonogramColorButtonsListener implements NonogramComponentStateListener
{
    constructor(
        private readonly state: NonogramComponentState,
        private readonly btnUndo: HTMLButtonElement,
        private readonly btnRedo: HTMLButtonElement,
        private readonly btnBlack: HTMLButtonElement,
        private readonly btnWhite: HTMLButtonElement,
        private readonly btnResetToLastValidState: HTMLButtonElement
    ) {
        this.onColorChange();
        this.onStateChange();
    }

    onChange(type: StateChangeType): void {
        if (type == StateChangeType.CHOSEN_COLOR) {
            this.onColorChange();
        }

        if (type == StateChangeType.BOARD_STATE) {
            this.onStateChange();
        }
    }

    private onColorChange() {
        if (this.state.chosenColor == NonogramColor.BLACK) {
            this.btnBlack.classList.add("checked");
            this.btnWhite.classList.remove("checked");
        } else {
            this.btnBlack.classList.remove("checked");
            this.btnWhite.classList.add("checked");
        }
    }

    private onStateChange() {
        this.btnUndo.disabled = this.state.historyIdx == 0;
        this.btnRedo.disabled = this.state.historyIdx == this.state.history.length - 1;
        this.btnResetToLastValidState.disabled = this.state.errorLines.length == 0;
    }
    
}