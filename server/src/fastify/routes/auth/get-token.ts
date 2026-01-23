import { FastifyPluginAsync } from 'fastify'
import auth from "../../../auth/auth"

const getToken: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get('/token', async function (request, reply) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw fastify.httpErrors.unauthorized("Missing authorization header.");
        }

        const tokens = await auth.performLogin(fastify, authHeader);
        if (!tokens) {
            throw fastify.httpErrors.unauthorized("Bad credentials");
        }

        return tokens;
    });
}

export default getToken
