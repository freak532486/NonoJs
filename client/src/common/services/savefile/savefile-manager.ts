import { MergeStrategy } from "./savefile-merger";
import { Component } from "nonojs-common";
import tokens from "../../tokens";
import SavefileAccess from "./savefile-access";

export default class SavefileManager extends Component
{

    constructor(
        private readonly savefileAccess: SavefileAccess
    )
    {
        super();
    }

    /**
     * Initialized the savefile in local storage, syncs it with the server.
     */
    async initializeLocalSavefile()
    {
        const merger = this.ctx.getComponent(tokens.savefileMerger);
        const authService = this.ctx.getComponent(tokens.authService);

        const serverSavefile = await this.savefileAccess.fetchServerSavefile();
        const localSavefile = await this.savefileAccess.fetchLocalSavefile();
        const username = await authService.getCurrentUsername();

        /* When loading savefiles, the server savefile wins */
        const merged = merger.getMergedSavefileForUser(
            serverSavefile,
            localSavefile,
            username,
            MergeStrategy.SERVER_WINS
        );

        this.savefileAccess.writeLocalSavefile(merged);
    }

    /**
     * Writes the state of the local savefile to the server.
     */
    async writeLocalSavefileToServer()
    {
        const authService = this.ctx.getComponent(tokens.authService);
        const merger = this.ctx.getComponent(tokens.savefileMerger);

        const serverSavefile = await this.savefileAccess.fetchServerSavefile();
        const localSavefile = await this.savefileAccess.fetchLocalSavefile();
        const username = await authService.getCurrentUsername();

        /* Nothing to do if not logged in */
        if (!username) {
            return;
        }

        /* When writing savefiles, the local savefile wins */
        const merged = merger.getMergedSavefileForUser(
            serverSavefile,
            localSavefile,
            username,
            MergeStrategy.LOCAL_WINS
        );

        await this.savefileAccess.writeServerSavefile(merged);
    }
}