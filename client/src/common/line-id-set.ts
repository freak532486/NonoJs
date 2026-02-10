import { LineId, LineType } from "./nonogram-types";

export default class LineIdSet
{
    #rows = new Set<number>();
    #cols = new Set<number>();

    /**
     * Adds a line to the set.
     */
    add(lineId: LineId) {
        const relevantSet = lineId.lineType == LineType.ROW ? this.#rows : this.#cols;
        relevantSet.add(lineId.index);
    }

    /**
     * Removes a line from the set.
     */
    remove(lineId: LineId) {
        const relevantSet = lineId.lineType == LineType.ROW ? this.#rows : this.#cols;
        relevantSet.delete(lineId.index);
    }

    /**
     * Checks if a line is contained in this set.
     */
    has(lineId: LineId): boolean {
        const relevantSet = lineId.lineType == LineType.ROW ? this.#rows : this.#cols;
        return relevantSet.has(lineId.index);
    }

    /**
     * Returns this set as an array.
     */
    asArray(): Array<LineId> {
        const ret: Array<LineId> = [];
        this.#rows.forEach(idx => ret.push(new LineId(LineType.ROW, idx)));
        this.#cols.forEach(idx => ret.push(new LineId(LineType.COLUMN, idx)));
        return ret;
    }

    /**
     * Returns the current size of the set.
     */
    get size(): number {
        return this.#rows.size + this.#cols.size;
    }
}