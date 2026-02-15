import { CatalogAccess } from "../../catalog/catalog-access";
import { SerializedNonogram } from "../../common/storage-types";
import SavefileAccess from "../../savefile/savefile-access";

export class StartPageNonogramSelector {

    constructor(
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess
    ) {}

    /**
     * Returns the nonogram that the player played most recently.
     * 
     * @returns {Promise<string | undefined>}
     */
    async getLastPlayedNonogramId() {
        return (await this.savefileAccess.fetchLocalSavefile()).lastPlayedNonogramId;
    }

    /**
     * Returns the list of "nonograms of the day".
     * 
     * @returns {Promise<Array<string>>}
     */
    async getNonogramIdsOfTheDay() {
        const allNonograms = await this.catalogAccess.getAllNonograms();

        const nonoSize = (nonogram: SerializedNonogram) => Math.max(nonogram.rowHints.length, nonogram.colHints.length);

        /* Sort nonograms into small, medium and large */
        const smallNonograms = allNonograms.filter(x => nonoSize(x) >= 0 && nonoSize(x) < 20);
        const mediumNonograms = allNonograms.filter(x => nonoSize(x) >= 20 && nonoSize(x) < 40);
        const largeNonograms = allNonograms.filter(x => nonoSize(x) >= 40 && nonoSize(x) < Number.MAX_VALUE);

        /* Pick random value based on date */
        const curDate = getCurrentDate();

        const smallIdx = hash(curDate + "-1") % smallNonograms.length;
        const mediumIdx = hash(curDate + "-2") % mediumNonograms.length;
        const largeIdx = hash(curDate + "-2") % largeNonograms.length;

        return [ smallNonograms[smallIdx].id, mediumNonograms[mediumIdx].id, largeNonograms[largeIdx].id ];
    }

    /**
     * Returns a random nonogram to play.
     */
    async getRandomNonogramId(): Promise<string> {
        const allNonograms = await this.catalogAccess.getAllNonograms();
        const randomNonogram = allNonograms[randInt(0, allNonograms.length)];
        return randomNonogram.id;
    }

};

/**
 * Returns a pseudorandom integer between lo (inclusive) and hi (exclusive). lo and hi must be integers themselves.
 */
function randInt(lo: number, hi: number): number {
    return lo + Math.floor(Math.random() * (hi - lo));
}

/**
 * Creates a 32 bit hash from the given string.
 */
function hash(str: string): number {
    let hash = 0;
    for (const char of str) {
        hash = (hash << 5) - hash + char.charCodeAt(0);
        hash |= 0; // Constrain to 32bit integer
    }
    return hash;
}

/**
 * Returns the current date in 'YYYY-MM-DD' format.
 */
function getCurrentDate(): string {
    const date = new Date();

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return year + "-" + month + "-" + day;
}