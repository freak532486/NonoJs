import { Component, Context, SaveFile } from "nonojs-common";
import SavefileAccess from "./savefile-access.js";
import tokens from "../tokens.js";

export const ACTIVE_VERSION_KEY = 3;

export default class SavefileMigrator extends Component {

    async performStorageMigration() {
        const savefileAccess = this.ctx.getComponent(tokens.savefileAccess);

        const val = await savefileAccess.fetchLocalSavefile();
        if (!val) {
            return;
        }

        await MIGR001_addVersionKey(val);
        await MIGR002_addSolvedFlag(val);
        await MIGR003_addUsername(val);

        savefileAccess.writeLocalSavefile(val);
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