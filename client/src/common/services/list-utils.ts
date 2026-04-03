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

    /**
     * Removes all elements in the array that fulfill the given predicate. Returns the number of removed elements.
     */
    export function removeIf<T>(arr: Array<T>, pred: (t: T) => boolean): number
    {
        let removed = 0;

        for (let i = arr.length - 1; i >= 0; i--) {
            if (pred(arr[i])) {
                arr.splice(i, 1);
                removed++;
            }
        }

        return removed;
    }

}