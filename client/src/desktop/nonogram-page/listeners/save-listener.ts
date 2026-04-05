import { SavestateHistoryDelta } from "nonojs-common";
import AuthService from "../../../common/services/auth/auth-service";
import { ListUtils } from "../../../common/services/list-utils";
import SavefileAccess from "../../../common/services/savefile/savefile-access";
import SavefileSyncService from "../../../common/services/savefile/savefile-sync-service";
import { SavefileUtils } from "../../../common/services/savefile/savefile-utils";
import { CellKnowledge, NonogramState } from "../../../common/types/nonogram-types";
import { NonogramComponentState, NonogramComponentStateListener, StateChangeType } from "../state";
import { CatalogAccess } from "../../../common/services/catalog/catalog-access";

export default class SaveListener implements NonogramComponentStateListener
{

    private syncService: SavefileSyncService;

    constructor (
        private readonly state: NonogramComponentState,
        private readonly authService: AuthService,
        private readonly savefileAccess: SavefileAccess,
        private readonly catalogAccess: CatalogAccess
    )
    {
        this.syncService = new SavefileSyncService(authService, savefileAccess, catalogAccess);
    }

    async onChange(type: StateChangeType): Promise<void> {
        if (type !== StateChangeType.BOARD_STATE) {
            return;
        }


        const savefile = await this.savefileAccess.fetchLocalSavefile();
        let savestate = SavefileUtils.getSavestateForNonogram(savefile, this.state.nonogramId);
        if (savestate == undefined) {
            savestate = { history: [], elapsed: 0 };
            savefile.entries.push({ nonogramId: this.state.nonogramId, state: savestate });
        }

        savestate.history = SavefileUtils.getSavestateHistory(this.state.history.map(x => x.state));
        savestate.elapsed = this.state.elapsed;
        if (!this.state.isSolved) {
            ListUtils.addIfNotExists(savefile.activeNonogramIds, this.state.nonogramId);
        } else {
            ListUtils.remove(savefile.activeNonogramIds, this.state.nonogramId);
        }

        await this.savefileAccess.writeLocalSavefile(savefile);
        this.syncService.queueSync();
    }
    
}