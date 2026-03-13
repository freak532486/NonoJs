/**
 * Returns the given number of seconds into a HH:MM:SS-timestring. Example: 3663 becomes "01:01:03".
 */
export function getTimeString(elapsedSeconds: number): string {
    const seconds = Math.floor(elapsedSeconds % 60);
    const minutes = Math.floor(((elapsedSeconds - seconds) / 60)) % 60;
    const hours = Math.floor((elapsedSeconds - seconds - 60 * minutes) / (60 * 60));

    if (hours == 0) {
        return withLeadingZero(minutes) + ":" + withLeadingZero(seconds);
    } else {
        return withLeadingZero(hours) + ":" + withLeadingZero(minutes) + ":" + withLeadingZero(seconds);
    }
}

/**
 * Returns the string representation of the given number. If the number is single-digit, prepends a zero.
 */
function withLeadingZero(n: number): string {
    return n < 10 ? "0" + n : String(n);
}