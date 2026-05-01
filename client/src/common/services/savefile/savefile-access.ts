import { SaveFile } from "nonojs-common";
import * as api from "../api/api-client"
import AuthService from "../auth/auth-service";
import SavefileMigrator, { ACTIVE_VERSION_KEY } from "nonojs-common/dist/service/savefile-migrator";
import SavefileMerger from "./impl/savefile-merger";
import { CatalogAccess } from "../catalog/catalog-access";
import RateLimitedJobExecutor from "./impl/rate-limited-job-executor";

const STORAGE_KEY = "storage";
const MS_BETWEEN_SERVER_SYNCS = 1000;

export type SavefileType = "USER" | "USERLESS";

export default class SavefileAccess
{

    /**
     * Set of all savefile usernames for which a savefile migration has already been performed.
     */
    private migrationsPerformed: Set<string | undefined> = new Set();

    /**
     * Similarily, syncing with server savefile is done once per pageload and username.
     */
    private serverSyncsPerformed: Set<string> = new Set();

    /**
     * Map from username to matching executor that executes the server savefile sync.
     */ 
    private syncExceutors: Map<string, RateLimitedJobExecutor> = new Map();
    
    constructor(
        private readonly authService: AuthService,
        private readonly catalogAccess: CatalogAccess
    ) {}

    /**
     * Returns the active savefile. If no such savefile exists, a new empty savefile is returned.
     */
    async getSavefile(type: SavefileType = "USER"): Promise<SaveFile> {
        /* Fetch savefile from local storage */
        const username = type == "USERLESS" ? undefined : await this.authService.getCurrentUsername();
        const storageKey = STORAGE_KEY + (username ? "_" + username : "");
        const serializedLocalSavefile = window.localStorage.getItem(storageKey);
        const localSavefile = serializedLocalSavefile ?
            JSON.parse(serializedLocalSavefile) as SaveFile :
            createEmptySavefile(username);

        /* Maybe perform local storage migration */
        if (!this.migrationsPerformed.has(username)) {
            new SavefileMigrator().performSavefileMigration(localSavefile);
            window.localStorage.setItem(storageKey, JSON.stringify(localSavefile));
            this.migrationsPerformed.add(username);
        }

        /* No sync with server necessary if this is a userless savefile or if sync was already done. */
        if (username == undefined || this.serverSyncsPerformed.has(username)) {
            return localSavefile;
        }

        /* Load server savefile */
        const request = new Request("/api/savefile", { "method": "GET" });
        const response = await api.performRequestWithSessionToken(request);
        const serverSavefile = response.status == "ok" ?
            await response.data.json() as SaveFile :
            createEmptySavefile(username);

        /* Merge local and server savefile */
        const mergedSavefile = await new SavefileMerger(this.catalogAccess).mergeSavefiles(localSavefile, serverSavefile);
        window.localStorage.setItem(storageKey, JSON.stringify(mergedSavefile));
        this.serverSyncsPerformed.add(username);

        /* Return merged savefile */
        return mergedSavefile;
    }

    /**
     * Overwrites the current user's savefile.
     */
    async writeSavefile(savefile: SaveFile, type: SavefileType = "USER"): Promise<void>
    {
        /* Overwrite local savefile */
        const username = type == "USERLESS" ? undefined : await this.authService.getCurrentUsername();
        const storageKey = STORAGE_KEY + (username ? "_" + username : "");
        window.localStorage.setItem(storageKey, JSON.stringify(savefile));

        /* Done if this was a userless savefile */
        if (username == undefined) {
            return;
        }

        /* Queue a server sync write */
        if (!this.syncExceutors.has(username)) {
            this.syncExceutors.set(username, new RateLimitedJobExecutor(
                async () => {
                    await this.writeServerSavefile(savefile);
                },
                MS_BETWEEN_SERVER_SYNCS
            ));
        }

        this.syncExceutors.get(username)!.queue();
    }

    /**
     * Deletes the savefile.
     */
    async deleteSavefile(type: SavefileType = "USER"): Promise<void>
    {
        /* Delete from local storage */
        const username = type == "USERLESS" ? undefined : await this.authService.getCurrentUsername();
        const storageKey = STORAGE_KEY + (username ? "_" + username : "");
        window.localStorage.removeItem(storageKey);

        /* Done if this was a userless savefile */
        if (username == undefined) {
            return;
        }

        /* Currently, deleting savefile from server is not possible (except by deleting the user itself) */
    }

    /**
     * Writes the given savefile to the server (based on the currently logged-in user)
     */
    private async writeServerSavefile(savefile: SaveFile): Promise<"ok" | "not_logged_in" | "error">
    {
        const serialized = JSON.stringify(savefile);
        const request = new Request("/api/savefile", {
            "method": "PUT",
            "body": serialized,
            "headers": {
                "Content-Type": "application/json"
            }
        });
        const response = await api.performRequestWithSessionToken(request);

        if (response.status == "unauthorized") {
            return "not_logged_in";
        } else if (response.status == "bad_response" || response.status == "error") {
            return "error";
        }

        return "ok";
    }

}

function createEmptySavefile(username: string | undefined): SaveFile
{
    return {
        versionKey: ACTIVE_VERSION_KEY,
        username: username,
        activeNonogramIds: [],
        entries: []
    };
}