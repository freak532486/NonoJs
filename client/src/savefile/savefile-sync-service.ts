import { Component, Context } from "nonojs-common";
import tokens from "../tokens";

const SYNC_INTERVAL_MS = 1 * 1000;

export default class SavefileSyncService extends Component
{
    #syncQueued: boolean = false;
    #lastSyncTs: number | undefined;

    /**
     * Queues a sync between server savefile and local savefile.
     */
    queueSync() {
        if (this.#syncQueued) {
            return;
        }

        this.#syncQueued = true;
        setTimeout(() => this.#doSync(), this.getTimeToSyncMs());
    }

    /**
     * Forces a sync between server savefile and local savefile. Use queueSync() unless an immediate sync is really
     * absolutely necessary.
     */
    forceSync() {
        this.#doSync();
    }

    async #doSync() {
        const access = this.ctx.getComponent(tokens.savefileAccess);
        const merger = this.ctx.getComponent(tokens.savefileMerger);

        const serverSavefile = await access.fetchServerSavefile() ;
        const localSavefile = await access.fetchLocalSavefile();
        const merged = merger.mergeSavefiles(serverSavefile, localSavefile);
        await access.writeServerSavefile(merged);

        this.#syncQueued = false;
        this.#lastSyncTs = Date.now();
    }

    /**
     * Returns the number of milliseconds until the next sync will happen. Returns 'undefined' if the local and server
     * state are sync and no sync is planned.
     */
    getTimeToSyncMs(): number | undefined
    {
        if (!this.#syncQueued) {
            return undefined;
        }

        if (!this.#lastSyncTs) {
            return 0;
        }

        const nextSyncTs = this.#lastSyncTs + SYNC_INTERVAL_MS;
        return Math.max(0, nextSyncTs - Date.now());
    }

};