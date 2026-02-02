import { FastifyInstance } from "fastify";
import * as authUtils from "../internal/utils"
import TokenPair from "../types/token-pair"
import { getUserForRefreshToken, putRefreshToken } from "./auth-sql";

/**
 * Regenerates the session- and refresh-token for the given user.
 */
export async function refreshTokenForUser(fastify: FastifyInstance, userId: number): Promise<TokenPair> {
    /* Generate tokens */
    const sessionToken = authUtils.generateRandomToken();
    const refreshToken = authUtils.generateRandomToken();
    const creationTimestamp = Date.now();

    /* Write session token into memory */
    fastify.state.tokenStore.putSessionToken(userId, sessionToken, creationTimestamp);

    /* Write refresh token into database */
    await putRefreshToken(fastify, userId, refreshToken, creationTimestamp);

    /* Done */
    return {
        "sessionToken": sessionToken,
        "refreshToken": refreshToken
    }
}

/**
 * Refreshes the tokens for the session with the given refresh token. Returns undefined if no such session exists.
 */
export async function refreshSession(fastify: FastifyInstance, refreshToken: string): Promise<TokenPair | undefined> {
    const userId = await getUserForRefreshToken(fastify, refreshToken);
    if (userId == undefined) {
        return undefined;
    }

    /* Perform refresh */
    return refreshTokenForUser(fastify, userId);
}