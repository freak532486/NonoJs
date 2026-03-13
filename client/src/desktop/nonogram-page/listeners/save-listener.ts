import SavefileAccess from "../../../common/services/savefile/savefile-access";
import SavefileSyncService from "../../../common/services/savefile/savefile-sync-service";
import { getSavestateForNonogram } from "../../../common/services/savefile/savefile-utils";
import { NonogramComponentState, NonogramComponentStateListener, StateChangeType } from "../state";

export default class SaveListener implements NonogramComponentStateListener
{

    private syncService: SavefileSyncService;

    constructor (
        private readonly state: NonogramComponentState,
        private readonly savefileAccess: SavefileAccess
    )
    {
        this.syncService = new SavefileSyncService(savefileAccess);
    }

    async onChange(type: StateChangeType): Promise<void> {
        if (type !== StateChangeType.BOARD_STATE) {
            return;
        }


        const savefile = await this.savefileAccess.fetchLocalSavefile();
        let savestate = getSavestateForNonogram(savefile, this.state.nonogramId);
        if (savestate == undefined) {
            savestate = { cells: [], elapsed: 0 };
            savefile.entries.push({ nonogramId: this.state.nonogramId, state: savestate });
        }

        savestate.cells = this.state.activeState.cells;
        savestate.elapsed = this.state.elapsed;

        await this.savefileAccess.writeLocalSavefile(savefile);
        this.syncService.queueSync();
    }
    
}