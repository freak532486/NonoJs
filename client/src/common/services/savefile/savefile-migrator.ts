import { SaveFile } from "nonojs-common";
import SavefileAccess from "./savefile-access.js";
import { CellKnowledge } from "../../types/nonogram-types.js";
import SavefileMigrator from "nonojs-common/dist/service/savefile-migrator.js";

export const ACTIVE_VERSION_KEY = 5;

export default class ClientSavefileMigrator {

    constructor(
        private readonly savefileAccess: SavefileAccess
    )
    {}

    async performStorageMigration() {
        const val = await this.savefileAccess.fetchLocalSavefile();
        if (!val) {
            return;
        }

        await new SavefileMigrator().performSavefileMigration(val);

        this.savefileAccess.writeLocalSavefile(val);
    }

}