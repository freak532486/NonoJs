import AuthService from "../../../services/auth/auth-service";
import { CatalogAccess } from "../../../services/catalog/catalog-access";
import SavefileAccess from "../../../services/savefile/savefile-access";
import Settings from "../index/settings.component";
import DeleteAccountEntry from "./delete-account-entry/delete-account-entry.component";
import ExportImportEntry from "./export-import-entry/export-import-entry.component";
import SavefileMergeEntry from "./savefile-merge-entry/savefile-merge-entry.component";

export default class SettingEntriesManager
{
    
    constructor(
        private readonly settings: Settings,
        private readonly savefileAccess: SavefileAccess,
        private readonly authService: AuthService,
        private readonly catalogAccess: CatalogAccess
    ) {}

    async createSettingsEntries()
    {
        /* Entry for importing/exporting savefiles */
        const importExportEntry = new ExportImportEntry(this.savefileAccess);
        this.settings.addEntry(importExportEntry.view);

        /* Entry for merging local savefile to user savefile */
        const username = await this.authService.getCurrentUsername();
        const localSavefile = this.savefileAccess.fetchLocalSavefileForUser(undefined);

        if (username && localSavefile) {
            const mergeEntry = new SavefileMergeEntry(this.authService, this.savefileAccess, this.catalogAccess, username);
            this.settings.addEntry(mergeEntry.view);
        }

        /* Entry for deleting active account */
        if (username) {
            const deleteAccountEntry = new DeleteAccountEntry(this.authService, username);
            this.settings.addEntry(deleteAccountEntry.view);
        }
    }

}