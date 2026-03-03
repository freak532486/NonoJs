import NonojsClient from "../../types/nonojs-client";

export default interface Route
{
    /**
     * Returns 'true' iff this route is a match for the given path/URL.
     */
    matches(path: string): boolean;

    /**
     * Performs the action associated with this route.
     */
    run(client: NonojsClient): void | Promise<void>;
}