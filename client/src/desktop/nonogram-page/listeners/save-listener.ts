import { ListUtils } from "../../../common/services/list-utils";
import SavefileAccess from "../../../common/services/savefile/savefile-access";
import { SavefileUtils } from "../../../common/services/savefile/savefile-utils";
import { NonogramComponentState, NonogramComponentStateListener, StateChangeType } from "../state";

export default class SaveListener implements NonogramComponentStateListener
{

    constructor (
        private readonly state: NonogramComponentState,
        private readonly savefileAccess: SavefileAccess,
    )
    {}

    async onChange(type: StateChangeType): Promise<void> {
        if (type !== StateChangeType.BOARD_STATE) {
            return;
        }


        const savefile = await this.savefileAccess.getSavefile();
        let entry = SavefileUtils.getEntryForNonogram(savefile, this.state.nonogramId);
        if (entry == undefined) {
            const savestate = { history: [], elapsed: 0 };
            entry = {
                nonogramId: this.state.nonogramId,
                state: savestate,
                lastModified: Date.now()
            };
            savefile.entries.push(entry);
        }

        entry.state.history = SavefileUtils.getSavestateHistory(this.state.history.map(x => x.state));
        entry.state.elapsed = this.state.elapsed;
        entry.lastModified = Date.now();
        if (!this.state.isSolved) {
            ListUtils.addIfNotExists(savefile.activeNonogramIds, this.state.nonogramId);
        } else {
            ListUtils.remove(savefile.activeNonogramIds, this.state.nonogramId);
        }

        await this.savefileAccess.writeSavefile(savefile);
    }
    
}