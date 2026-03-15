import AuthService from "../auth/auth-service";
import SavefileAccess from "./savefile-access";
import SavefileMerger from "./savefile-merger";

const SYNC_INTERVAL_MS = 1 * 1000;

export default class SavefileSyncService
{
    #syncQueued: boolean = false;
    #lastSyncTs: number | undefined;

    private merger: SavefileMerger;

    constructor(
        private readonly authService: AuthService,
        private readonly savefileAccess: SavefileAccess
    )
    {
        this.merger = new SavefileMerger(authService, savefileAccess);
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
        const serverSavefile = await this.savefileAccess.fetchServerSavefile() ;
        const localSavefile = await this.savefileAccess.fetchLocalSavefile();
        const merged = this.merger.mergeSavefiles(serverSavefile, localSavefile);
        await this.savefileAccess.writeServerSavefile(merged);

        /* Failed syncs are ignored, in case you are sitting in the train and have no internet or something. */
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