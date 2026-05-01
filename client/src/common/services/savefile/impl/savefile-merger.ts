import { ACTIVE_VERSION_KEY, Nonogram, SaveFile, SaveFileEntry, SaveState } from "nonojs-common";
import { CellKnowledge } from "../../../types/nonogram-types";
import { CatalogAccess } from "../../catalog/catalog-access";
import { SavefileUtils } from "../savefile-utils"

export enum MergeStrategy {
    LOCAL_WINS,
    SERVER_WINS
};

export default class SavefileMerger
{

    constructor(
        private readonly catalogAccess: CatalogAccess
    )
    {}

    /**
     * Merges two savefiles. If there is a conflict on some data, then the winning savefile wins.
     */
    async mergeSavefiles(
        losingSavefile: SaveFile,
        winningSavefile: SaveFile
    ): Promise<SaveFile>
    {
        /* Assumption: Server has more recent state. */
        const activeNonogramIds = [];
        
        /* Merge entries: Overwrite based on merge strategy, but keep all entries from both sources */
        const entryMap = new Map<string, SaveFileEntry>();

        for (const entry of losingSavefile.entries) {
            entryMap.set(entry.nonogramId, entry);
        }

        for (const entry of winningSavefile.entries) {
            const losingEntry = entryMap.get(entry.nonogramId);

            if (losingEntry == undefined || losingEntry.lastModified < entry.lastModified) {
                entryMap.set(entry.nonogramId, entry);
            }
        }

        const mergedEntries: Array<SaveFileEntry> = [];
        for (const mapEntry of entryMap.entries()) {
            const nonogramId = mapEntry[0];
            const nonogram = await this.catalogAccess.getNonogram(nonogramId);
            if (nonogram == undefined) {
                continue;
            }

            const savefileEntry = mapEntry[1];
            mergedEntries.push(savefileEntry);
            if (isActiveNonogram(savefileEntry.state, nonogram)) {
                activeNonogramIds.push(nonogramId);
            }
        }

        /* Done */
        return {
            versionKey: ACTIVE_VERSION_KEY,
            username: winningSavefile.username || losingSavefile.username,
            activeNonogramIds: activeNonogramIds,
            entries: mergedEntries
        };
    }

};

function isActiveNonogram(saveState: SaveState, nonogram: Nonogram)
{
    const cells = SavefileUtils.calculateActiveState(
        nonogram.colHints.length,
        nonogram.rowHints.length,
        saveState.history
    );

    const numFilled = cells
        .map(x => x == CellKnowledge.UNKNOWN ? 0 : 1)
        .map(x => x as number)
        .reduce((a, b) => a + b, 0);

    return numFilled > 0 && numFilled < cells.length;
}