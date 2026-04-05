import { SaveFile, SaveState, SavestateHistoryDelta } from "nonojs-common";
import { ListUtils } from "../list-utils";
import { CellKnowledge, NonogramState } from "../../types/nonogram-types";

export namespace SavefileUtils {

    /**
     * Returns the savestate for the given nonogram in the savefile.
     */
    export function getSavestateForNonogram(savefile: SaveFile, nonogramId: string): SaveState | undefined {
        return savefile.entries.find(entry => entry.nonogramId == nonogramId)?.state;
    }

    /**
     * Returns a map from nonogram id to contained savestate for that nonogram.
     */
    export function getAllStoredStates(savefile: SaveFile): Map<string, SaveState> {
        const ret = new Map();
        savefile.entries.forEach(entry => ret.set(entry.nonogramId, entry.state));
        return ret;
    }

    /**
     * Modifies the savefile by either replacing the savestate for the given nonogram with the given state, or adding the
     * state to the savefile.
     */
    export function putSavestate(savefile: SaveFile, nonogramId: string, state: SaveState) {
        const matchingEntry = savefile.entries.find(entry => entry.nonogramId == nonogramId);

        if (matchingEntry) {
            matchingEntry.state = state;
        } else {
            savefile.entries.push({
                nonogramId: nonogramId,
                state: state
            });
        }
    }

    /**
     * Removes the savestate for the given nonogram id, if such a savestate exists.
     */
    export function removeSavestate(savefile: SaveFile, nonogramId: string)
    {
        ListUtils.removeIf(savefile.entries, entry => entry.nonogramId == nonogramId);
    }

    /**
     * Calculates the cell array for the latest state in the given stored history.
     */
    export function calculateActiveState(
        nonogramWidth: number,
        nonogramHeight: number,
        history: Array<SavestateHistoryDelta>
    ): Array<CellKnowledge>
    {
        const ret: Array<CellKnowledge> = new Array(nonogramWidth * nonogramHeight).fill(CellKnowledge.UNKNOWN);

        for (const entry of history) {
            applyHistoryDelta(ret, entry);
        }

        return ret;
    }

    /**
     * Calculates the full states of all nonograms in the stored history.
     */
    export function calculateAllStates(
        nonogramWidth: number,
        nonogramHeight: number,
        history: Array<SavestateHistoryDelta>
    ): Array<Array<CellKnowledge>>
    {
        const cur: Array<CellKnowledge> = new Array(nonogramWidth * nonogramHeight).fill(CellKnowledge.UNKNOWN);
        const ret = [];

        for (const entry of history) {
            ret.push([...cur]);
            applyHistoryDelta(cur, entry);
        }

        ret.push([...cur]);

        return ret;
    }

    /** Applies the given delta to the given cell array. */
    function applyHistoryDelta(
        curState: Array<CellKnowledge>,
        delta: SavestateHistoryDelta
    )
    {
        for (let i = 0; i < delta.changes.length; i += 2) {
            const color = delta.changes[i] as CellKnowledge;
            const cell = delta.changes[i + 1];

            curState[cell] = color;
        }
    }

    /**
     * Returns the delta history that should be stored in a savestate for a history of full nonogram states.
     */
    export function getSavestateHistory(history: Array<NonogramState>): Array<SavestateHistoryDelta>
    {
        if (history.length == 0) {
            return [];
        }
    
        const width = history[0].colHints.length;
        const height = history[0].rowHints.length;
        const ret = [];
    
        let base = new Array(width * height).fill(CellKnowledge.UNKNOWN);
        for (const state of history) {
            ret.push(getDelta(base, state.cells));
            base = state.cells;
        }
    
        return ret;
    }
    
    /**
     * Returns the delta object for two cell arrays.
     */
    function getDelta(oldCells: Array<CellKnowledge>, newCells: Array<CellKnowledge>): SavestateHistoryDelta
    {
        if (oldCells.length !== newCells.length) {
            throw new Error("Cannot create delta of cell arrays with different length.");
        }
    
        const ret = [];
        for (let i = 0; i < oldCells.length; i++) {
            const oldCell = oldCells[i];
            const newCell = newCells[i];
    
            if (oldCell !== newCell) {
                ret.push(newCell as number);
                ret.push(i);
            }
        }
    
        return { changes: ret };
    }

}