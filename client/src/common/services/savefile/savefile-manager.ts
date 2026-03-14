import SavefileMerger, { MergeStrategy } from "./savefile-merger";
import { Component } from "nonojs-common";
import tokens from "../../tokens";
import SavefileAccess from "./savefile-access";
import AuthService from "../auth/auth-service";

export default class SavefileManager
{

    private merger: SavefileMerger;

    constructor(
        private readonly authService: AuthService,
        private readonly savefileAccess: SavefileAccess
    )
    {
        this.merger = new SavefileMerger(savefileAccess);
    }

    /**
     * Initialized the savefile in local storage, syncs it with the server.
     */
    async initializeLocalSavefile()
    {
        const serverSavefile = await this.savefileAccess.fetchServerSavefile();
        const localSavefile = await this.savefileAccess.fetchLocalSavefile();
        const username = await this.authService.getCurrentUsername();

        /* When loading savefiles, the server savefile wins */
        const merged = this.merger.getMergedSavefileForUser(
            serverSavefile,
            localSavefile,
            username,
            MergeStrategy.SERVER_WINS
        );

        this.savefileAccess.writeLocalSavefile(merged);
    }
}