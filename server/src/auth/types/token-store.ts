import TwoWayMap from "../../common/types/two-way-map";
import { SESSION_TOKEN_EXPIRY_MS } from "../internal/constants";

/**
 * A token store. It can store a single session token per user id.
 */
export default class TokenStore {
    #store = new TwoWayMap<number, string>();
    #sessionTokenToRefreshToken = new Map<string, string>();
    #creationTimestamps = new Map<string, number>();

    /**
     * Returns the session token of the given user, or undefined if no such session exists or the session expired.
     */
    getSessionToken(userId: number): string | undefined {
        /* Fetch session token */
        const sessionToken = this.#store.getByKey(userId);
        if (!sessionToken || !this.#isTokenValid(sessionToken)) {
            return undefined;
        }

        return sessionToken;
    }

    /**
     * Returns the refresh token associated with the given session token.
     */
    getRefreshTokenForSessionToken(sessionToken: string): string | undefined
    {
        if (!this.#isTokenValid(sessionToken)) {
            return undefined;
        }

        return this.#sessionTokenToRefreshToken.get(sessionToken);
    }

    /**
     * Returns the matching user id for the given session token, or undefined if no such user exists.
     */
    getUserId(sessionToken: string): number | undefined {
        if (!this.#isTokenValid(sessionToken)) {
            return undefined;
        }

        return this.#store.getByValue(sessionToken);
    }

    /**
     * Returns true if the given token exists and has not expired yet. Cleans up expired tokens.
     */
    #isTokenValid(sessionToken: string): boolean {
        const creationTimestamp = this.#creationTimestamps.get(sessionToken);
        if (creationTimestamp && Date.now() - creationTimestamp < SESSION_TOKEN_EXPIRY_MS) {
            return true;
        }

        /* Token is expired. Remove it. */
        this.removeSessionToken(sessionToken);
        return false;
    }

    /**
     * Updates the session token of the given user.
     */
    putSessionToken(userId: number, sessionToken: string, refreshToken: string, creationTimestamp: number) {
        this.#store.set(userId, sessionToken);
        this.#sessionTokenToRefreshToken.set(sessionToken, refreshToken);
        this.#creationTimestamps.set(sessionToken, creationTimestamp);
    }

    /**
     * Removes the given session token from the store.
     */
    removeSessionToken(sessionToken: string)
    {
        this.#store.deleteByValue(sessionToken);
        this.#sessionTokenToRefreshToken.delete(sessionToken);
        this.#creationTimestamps.delete(sessionToken);
    }
}