import { FastifyInstance } from "fastify";
import { removeSession } from "./auth-sql";

export async function performLogout(fastify: FastifyInstance, sessionToken: string)
{
    /* Fetch refresh token */
    const refreshToken = fastify.state.tokenStore.getRefreshTokenForSessionToken(sessionToken);
    if (!refreshToken) {
        return;
    }

    /* Remove session from database */
    await removeSession(fastify, refreshToken);

    /* Remove session from token store */
    fastify.state.tokenStore.removeSessionToken(sessionToken);
}