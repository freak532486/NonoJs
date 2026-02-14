import SavefileMerger, { MergeStrategy } from "./savefile-merger";
import SavefileAccess from "./savefile-access";
import { Component, Context } from "nonojs-common";
import tokens from "../tokens";

export default class SavefileManager extends Component
{

    /**
     * Initialized the savefile in local storage, syncs it with the server.
     */
    async initializeLocalSavefile()
    {
        const merger = this.ctx.getComponent(tokens.savefileMerger);

        const savefileAccess = this.ctx.getComponent(tokens.savefileAccess);
        const authService = this.ctx.getComponent(tokens.authService);

        const serverSavefile = await savefileAccess.fetchServerSavefile();
        const localSavefile = await savefileAccess.fetchLocalSavefile();
        const username = await authService.getCurrentUsername();

        /* When loading savefiles, the server savefile wins */
        const merged = merger.getMergedSavefileForUser(
            serverSavefile,
            localSavefile,
            username,
            MergeStrategy.SERVER_WINS
        );

        savefileAccess.writeLocalSavefile(merged);
    }

    /**
     * Writes the state of the local savefile to the server.
     */
    async writeLocalSavefileToServer()
    {
        const savefileAccess = this.ctx.getComponent(tokens.savefileAccess);
        const authService = this.ctx.getComponent(tokens.authService);
        const merger = this.ctx.getComponent(tokens.savefileMerger);

        const serverSavefile = await savefileAccess.fetchServerSavefile();
        const localSavefile = await savefileAccess.fetchLocalSavefile();
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

        await savefileAccess.writeServerSavefile(merged);
    }
}