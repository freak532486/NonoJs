import { FastifyPluginAsync } from "fastify";
import { GetNonogramsResponse, GetNonogramsResponseSchema } from "nonojs-common";
import { getAllNonograms } from "../../../../nonograms/nonograms";

const get: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.route<{
        Querystring: {
            nonogramId?: string,
            minWidth?: number,
            maxWidth?: number,
            minHeight?: number,
            maxHeight?: number
        },
        Reply: GetNonogramsResponse
    }>
    ({
        method: "GET",
        url: "/",
        schema: {
            response: {
                200: GetNonogramsResponseSchema
            }
        },
        handler: async (request, response) => {
            const nonograms = await getAllNonograms(
                fastify,
                request.query.nonogramId,
                request.query.minWidth,
                request.query.minHeight,
                request.query.maxWidth,
                request.query.maxHeight
            );

            return { nonograms: nonograms };
        }
    });
}

export default get