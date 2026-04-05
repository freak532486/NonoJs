import { Nonogram, SaveFile, SaveFileEntry, SaveState } from "nonojs-common";
import { ACTIVE_VERSION_KEY } from "./savefile-migrator";
import SavefileAccess from "./savefile-access";
import AuthService from "../auth/auth-service";
import { CellKnowledge } from "../../types/nonogram-types";
import { CatalogAccess } from "../catalog/catalog-access";
import { SavefileUtils } from "./savefile-utils";

export enum MergeStrategy {
    LOCAL_WINS,
    SERVER_WINS
};

export default class SavefileMerger
{

    constructor(
        private readonly authService: AuthService,
        private readonly savefileAccess: SavefileAccess,
        private readonly catalogAccess: CatalogAccess
    )
    {}

    /**
     * Merges the given local savefile and server savefile. Savefiles not belonging to the given username are filtered.
     * Returns the merge result.
     */
    async getMergedSavefileForUser(
        serverSavefile: SaveFile | undefined,
        localSavefile: SaveFile | undefined,
        username: string | undefined,
        mergeStrategy: MergeStrategy
    ): Promise<SaveFile>
    {
        /* Remove savefiles that do not match requested user */
        if (serverSavefile && serverSavefile.username !== username) {
            serverSavefile = undefined;
        }

        if (localSavefile && localSavefile.username !== username) {
            localSavefile = undefined;
        }

        /* Empty savefile on no savefile */
        if (!serverSavefile && !localSavefile) {
            return {
                versionKey: ACTIVE_VERSION_KEY,
                username: username,
                activeNonogramIds: [],
                entries: []
            };
        }

        /* No merge necessary if only server/local save exists */
        if (!serverSavefile) {
            return localSavefile!;
        }

        if (!localSavefile) {
            return serverSavefile!;
        }

        /* Merge savefiles */
        const losingSavefile = mergeStrategy == MergeStrategy.LOCAL_WINS ? serverSavefile : localSavefile;
        const winningSavefile = mergeStrategy == MergeStrategy.SERVER_WINS ? serverSavefile : localSavefile;
        return this.mergeSavefiles(losingSavefile, winningSavefile);
    }

    /**
     * Merges the local user-less savefile to the local savefile of the active user. The result is written to local
     * storage and to the server. The userless savefile is deleted.
     */
    async mergeLocalSavefileWithAccount(): Promise<"ok" | "not_logged_in" | "error">
    {
        const username = this.authService.getCurrentUsername();
        const freeSavefile = this.savefileAccess.fetchLocalSavefileForUser(undefined);
        const accountSavefile = await this.savefileAccess.fetchLocalSavefile();

        /* No sense merging if not logged in or no free savefile exists */
        if (!freeSavefile || !username) {
            return "ok";
        }

        /* Merge, userless savefile wins */
        const merged = await this.mergeSavefiles(accountSavefile, freeSavefile);

        /* Write savefile */
        this.savefileAccess.writeLocalSavefile(merged);
        const result = await this.savefileAccess.writeServerSavefile(merged);

        /* Delete userless savefile */
        if (result == "ok") {
            this.savefileAccess.deleteLocalSavefileForUser(undefined);
        }

        return result;
    }

    /**
     * Merges two savefiles. If there is a conflict on some data, then the winning savefile wins.
     */
    async mergeSavefiles(
        losingSavefile: SaveFile,
        winningSavefile: SaveFile
    ): Promise<SaveFile>
    {
        /* Assumption: Server has more recent state. */
        const activeNonogramIds = [];
        
        /* Merge entries: Overwrite based on merge strategy, but keep all entries from both sources */
        const entryMap = new Map<string, SaveState>();

        for (const entry of losingSavefile.entries) {
            entryMap.set(entry.nonogramId, entry.state);
        }

        for (const entry of winningSavefile.entries) {
            entryMap.set(entry.nonogramId, entry.state);
        }

        const mergedEntries: Array<SaveFileEntry> = [];
        for (const entry of entryMap.entries()) {
            const nonogramId = entry[0];
            const nonogram = await this.catalogAccess.getNonogram(nonogramId);
            if (nonogram == undefined) {
                continue;
            }

            const savestate = entry[1];

            mergedEntries.push({ nonogramId: nonogramId, state: savestate });
            if (isActiveNonogram(savestate, nonogram)) {
                activeNonogramIds.push(nonogramId);
            }
        }

        /* Done */
        return {
            versionKey: ACTIVE_VERSION_KEY,
            username: winningSavefile.username || losingSavefile.username,
            activeNonogramIds: activeNonogramIds,
            entries: mergedEntries
        };
    }

};

function isActiveNonogram(saveState: SaveState, nonogram: Nonogram)
{
    const cells = SavefileUtils.calculateActiveState(
        nonogram.colHints.length,
        nonogram.rowHints.length,
        saveState.history
    );

    const numFilled = cells
        .map(x => x == CellKnowledge.UNKNOWN ? 0 : 1)
        .map(x => x as number)
        .reduce((a, b) => a + b, 0);

    return numFilled > 0 && numFilled < cells.length;
}