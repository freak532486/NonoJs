import { SaveFile } from "nonojs-common";
import SavefileAccess from "./savefile-access.js";
import { CellKnowledge } from "../../types/nonogram-types.js";

export const ACTIVE_VERSION_KEY = 5;

export default class SavefileMigrator {

    constructor(
        private readonly savefileAccess: SavefileAccess
    )
    {}

    async performStorageMigration() {
        const val = await this.savefileAccess.fetchLocalSavefile();
        if (!val) {
            return;
        }

        await MIGR001_addVersionKey(val);
        await MIGR002_addSolvedFlag(val);
        await MIGR003_addUsername(val);
        await MIGR004_addActiveNonogramList(val);
        await MIGR005_stateToHistory(val);

        this.savefileAccess.writeLocalSavefile(val);
    }

}

/**
 * MIGR001: Adds a version key to the storage, so that migrations can detect old versions.
 */
async function MIGR001_addVersionKey(val: SaveFile) {
    const VERSION_KEY = 1;

    if (!val.versionKey) {
        val.versionKey = VERSION_KEY;
    }
}

/**
 * MIGR002: Adds the "elapsed" time to the savestate. Since we don't know how long the player has played the nonogram,
 *          we just put a zero.
 */
async function MIGR002_addSolvedFlag(val: SaveFile) {
    /* Version key check */
    const VERSION_KEY = 2;
    if (val.versionKey >= VERSION_KEY) {
        return;
    }
    val.versionKey = VERSION_KEY;

    /* Updater */
    for (const entry of val.entries) {
        entry.state.elapsed = 0;
    }
}

/**
 * MIGR003: Adds username to save file. This identifies which user the local storage belongs to and is used for merging
 *          local save files with server save files.
 */
async function MIGR003_addUsername(val: SaveFile) {
    /* Version key check */
    const VERSION_KEY = 3;
    if (val.versionKey >= VERSION_KEY) {
        return;
    }
    val.versionKey = VERSION_KEY;

    /* Updater */
    val.username = undefined;
}

/**
 * MIGR004: Instead of having a single 'lastPlayedNonogramId', we now keep a list of active nonograms, so that you can
 *          continue more than just one nonogram.
 */
async function MIGR004_addActiveNonogramList(val: SaveFile) {
    /* Version key check */
    const VERSION_KEY = 4;
    if (val.versionKey >= VERSION_KEY) {
        return;
    }
    val.versionKey = VERSION_KEY;

    /* Update list */
    const lastPlayedNonogramId: string | undefined = (val as any).lastPlayedNonogramId;
    if (lastPlayedNonogramId !== undefined) {
        val.activeNonogramIds = [ lastPlayedNonogramId ];
    } else {
        val.activeNonogramIds = [];
    }
}

/**
 * MIGR005: The full history of a nonogram is stored now, as deltas.
 */
async function MIGR005_stateToHistory(val: SaveFile)
{
    const VERSION_KEY = 5;
    if (val.versionKey >= VERSION_KEY) {
        return;
    }
    val.versionKey = VERSION_KEY;

    for (const entry of val.entries) {
        const savestate = entry.state;

        const cells = (savestate as any).cells as Array<CellKnowledge> | undefined;
        if (cells == undefined) {
            continue;
        }

        savestate.history = [{
            changes: cellsToHistoryDelta(cells)
        }];
        (savestate as any).cells = undefined;
    }
}

function cellsToHistoryDelta(cells: Array<CellKnowledge>): Array<number>
{
    const ret = [];
    for (let i = 0; i < cells.length; i++) {
        if (cells[i] == CellKnowledge.UNKNOWN) {
            continue;
        }

        ret.push(cells[i]);
        ret.push(i);
    }

    return ret;
}