import SavefileMerger, { MergeStrategy } from "./savefile-merger";
import SavefileAccess from "./savefile-access";
import AuthService from "../auth/auth-service";
import { CatalogAccess } from "../catalog/catalog-access";

export default class SavefileManager
{

    private merger: SavefileMerger;

    constructor(
        private readonly authService: AuthService,
        private readonly savefileAccess: SavefileAccess,
        private readonly catalogAccess: CatalogAccess
    )
    {
        this.merger = new SavefileMerger(authService, savefileAccess, catalogAccess);
    }

    /**
     * Initialized the savefile in local storage, syncs it with the server.
     */
    async initializeLocalSavefile()
    {
        const username = await this.authService.getCurrentUsername();
        const serverSavefile = username ? await this.savefileAccess.fetchServerSavefile() : undefined;
        const localSavefile = await this.savefileAccess.fetchLocalSavefile();

        /* When loading savefiles, the server savefile wins */
        const merged = await this.merger.getMergedSavefileForUser(
            serverSavefile,
            localSavefile,
            username,
            MergeStrategy.SERVER_WINS
        );

        await this.savefileAccess.writeLocalSavefile(merged);
    }
}