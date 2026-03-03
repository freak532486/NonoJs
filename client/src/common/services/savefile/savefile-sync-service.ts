import { Component } from "nonojs-common";
import tokens from "../../tokens";
import SavefileAccess from "./savefile-access";

const SYNC_INTERVAL_MS = 1 * 1000;

export default class SavefileSyncService extends Component
{
    #syncQueued: boolean = false;
    #lastSyncTs: number | undefined;

    constructor(
        private readonly savefileAccess: SavefileAccess
    )
    {
        super();
    }

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
        const merger = this.ctx.getComponent(tokens.savefileMerger);

        const serverSavefile = await this.savefileAccess.fetchServerSavefile() ;
        const localSavefile = await this.savefileAccess.fetchLocalSavefile();
        const merged = merger.mergeSavefiles(serverSavefile, localSavefile);
        await this.savefileAccess.writeServerSavefile(merged);

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