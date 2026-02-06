import SavefileMerger, { MergeStrategy } from "./savefile-merger";
import SavefileAccess from "./savefile-access";

export default class SavefileManager
{
    #savefileMerger: SavefileMerger = new SavefileMerger();

    constructor(
        private readonly savefileAccess: SavefileAccess,
        private readonly getActiveUsername: () => string | undefined
    )
    {}

    /**
     * Initialized the savefile in local storage, syncs it with the server.
     */
    async initializeLocalSavefile()
    {
        const serverSavefile = await this.savefileAccess.fetchSavefileFromServer();
        const localSavefile = this.savefileAccess.fetchSavefileFromLocal();
        const username = this.getActiveUsername();

        /* When loading savefiles, the server savefile wins */
        const merged = this.#savefileMerger.getMergedSavefileForUser(
            serverSavefile,
            localSavefile,
            username,
            MergeStrategy.SERVER_WINS
        );

        this.savefileAccess.writeSavefileToLocal(merged);
    }

    /**
     * Writes the state of the local savefile to the server.
     */
    async writeLocalSavefileToServer()
    {
        const serverSavefile = await this.savefileAccess.fetchSavefileFromServer();
        const localSavefile = this.savefileAccess.fetchSavefileFromLocal();
        const username = this.getActiveUsername();

        /* Nothing to do if not logged in */
        if (!username) {
            return;
        }

        /* When writing savefiles, the local savefile wins */
        const merged = this.#savefileMerger.getMergedSavefileForUser(
            serverSavefile,
            localSavefile,
            username,
            MergeStrategy.LOCAL_WINS
        );

        await this.savefileAccess.writeSavefileToServer(merged);
    }
}