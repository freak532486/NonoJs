import { FastifyPluginAsync } from 'fastify'
import auth from "../../../../auth/auth"
import { getSessionTokenOrThrow } from '../api-utils';

const logout: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.route({
        method: "GET",
        url: "/logout",
        handler: async (request, reply) => {
            const sessionToken = getSessionTokenOrThrow(fastify, request);
            await auth.logout(fastify, sessionToken);
        }
    });
}

export default logout
