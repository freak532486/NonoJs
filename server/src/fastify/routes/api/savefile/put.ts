import { FastifyPluginAsync } from 'fastify'
import { SaveFile, SaveFileSchema } from 'nonojs-common';
import savefile from '../../../../savefile/savefile';
import { getActiveUserIdOrThrow } from '../api-utils';

const put: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.route<{
        Body: SaveFile
    }>
    ({
        method: "PUT",
        url: "/",
        schema: {
            body: SaveFileSchema
        },
        handler: async (request, response) => {
            const userId = await getActiveUserIdOrThrow(fastify, request);
            savefile.putSavefileForUser(fastify, request.body, userId);
        }
    });
}

export default put
