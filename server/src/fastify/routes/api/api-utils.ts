import { FastifyInstance, FastifyRequest } from "fastify";
import auth from "../../../auth/auth"

/**
 * If the request is authenticated with a session token, then returns the matching user id, or undefined if session
 * token is invalid for some reason.
 */
export async function getActiveUserId(fastify: FastifyInstance, request: FastifyRequest) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        return undefined;
    }

    const sessionToken = auth.parseBearerAuthHeader(authHeader);
    if (!sessionToken) {
        return undefined;
    }

    return auth.getUserIdForSession(fastify, sessionToken);
}

export function getSessionTokenOrThrow(fastify: FastifyInstance, request: FastifyRequest): string
{
    const authHeader = request.headers.authorization;
    if (!authHeader) {
        throw fastify.httpErrors.unauthorized();
    }

    const parsed = auth.parseBearerAuthHeader(authHeader);
    if (!parsed) {
        throw fastify.httpErrors.unauthorized();
    }

    return parsed;
}