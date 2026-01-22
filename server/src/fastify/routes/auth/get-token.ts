import { GetTokenResponse } from "nonojs-common";
import { FastifyPluginAsync } from 'fastify'

const getToken: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.get('/token', async function (request, reply) {
        
        fastify.log.info("Login endpoint was called. Or was it? Probably not.");
        const response: GetTokenResponse = {
            "sessionToken": "abc",
            "refreshToken": "def"
        }
        return response;
    });
}

export default getToken
