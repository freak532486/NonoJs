import { Component, Context, SaveFile, SaveFileEntry, SaveState } from "nonojs-common";
import { ACTIVE_VERSION_KEY } from "./savefile-migrator";
import tokens from "../tokens";

export enum MergeStrategy {
    LOCAL_WINS,
    SERVER_WINS
};

export default class SavefileMerger extends Component
{
    /**
     * Merges the given local savefile and server savefile. Savefiles not belonging to the given username are filtered.
     * Returns the merge result.
     */
    getMergedSavefileForUser(
        serverSavefile: SaveFile | undefined,
        localSavefile: SaveFile | undefined,
        username: string | undefined,
        mergeStrategy: MergeStrategy
    ): SaveFile
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
                lastPlayedNonogramId: undefined,
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
    async mergeLocalSavefileWithAccount()
    {
        const authService = this.ctx.getComponent(tokens.authService);
        const savefileAccess = this.ctx.getComponent(tokens.savefileAccess);

        const username = authService.getCurrentUsername();
        const freeSavefile = savefileAccess.fetchLocalSavefileForUser(undefined);
        const accountSavefile = await savefileAccess.fetchLocalSavefile();

        /* No sense merging if not logged in or no free savefile exists */
        if (!freeSavefile || !username) {
            return;
        }

        /* Merge, userless savefile wins */
        const merged = this.mergeSavefiles(accountSavefile, freeSavefile);

        /* Write savefile */
        savefileAccess.writeLocalSavefile(merged);
        await savefileAccess.writeServerSavefile(merged);

        /* Delete userless savefile */
        savefileAccess.deleteLocalSavefileForUser(undefined);
    }

    /**
     * Merges two savefiles. If there is a conflict on some data, then the winning savefile wins.
     */
    mergeSavefiles(
        losingSavefile: SaveFile,
        winningSavefile: SaveFile
    ): SaveFile
    {
        /* Assumption: Server has more recent state. */
        const lastPlayedNonogramId = winningSavefile.lastPlayedNonogramId;
        
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
            mergedEntries.push({ nonogramId: entry[0], state: entry[1] });
        }

        /* Done */
        return {
            versionKey: ACTIVE_VERSION_KEY,
            username: winningSavefile.username || losingSavefile.username,
            lastPlayedNonogramId: lastPlayedNonogramId,
            entries: mergedEntries
        };
    }

};