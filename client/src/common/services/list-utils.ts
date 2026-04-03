export namespace ListUtils {

    /**
     * Adds the given element to the list if is not yet contained.
     */
    export function addIfNotExists<T>(arr: Array<T>, val: T)
    {
        if (!arr.includes(val)) {
            arr.push(val);
        }
    }

    /**
     * Removes the given value from the list. If it is not contained, returns 'false' and does nothing.
     */
    export function remove<T>(arr: Array<T>, val: T): boolean
    {
        const index = arr.indexOf(val);
        if (index === -1) {
            return false;
        }

        arr.splice(index, 1);
        return true;
    }

}