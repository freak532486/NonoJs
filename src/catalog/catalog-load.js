export class SerializedNonogram {
    /** @type {String} */
    name;

    /** @type {String} */
    difficulty;

    /** @type {Array<Array<number>>} */
    rowHints;

    /** @type {Array<Array<number>>} */
    colHints;

    /**
     * @param {String} name 
     * @param {String} difficulty 
     * @param {Array<Array<Number>>} rowHints 
     * @param {Array<Array<Number>>} colHints 
     */
    constructor (name, difficulty, rowHints, colHints) {
        this.name = name;
        this.difficulty = difficulty;
        this.rowHints = rowHints;
        this.colHints = colHints;
    }
};

/**
 * Fetches all stored nonograms and returns them.
 * 
 * @returns {Promise<Array<SerializedNonogram>>}
 */
export async function loadNonograms() {
    const listJson = await fetch("/nonograms/.list.json");
    const list = /** @type {Array<String>} */ (JSON.parse(await listJson.text()));

    const ret = [];
    for (const name of list) {
        const nonogramRes = await fetch("/nonograms/" + name + ".json");
        if (nonogramRes.status >= 400) {
            continue;
        }
        
        const nonogramJson = await nonogramRes.text();
        ret.push(/** @type {SerializedNonogram} */ (JSON.parse(nonogramJson)));
    }

    return ret;
}