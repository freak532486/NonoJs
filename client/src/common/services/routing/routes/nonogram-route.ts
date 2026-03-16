import NonojsClient from "../../../types/nonojs-client";
import Route from "../route";

export default class NonogramRoute implements Route
{

    matches(path: string): boolean {
        return path.startsWith("/n/")
    }

    async run(client: NonojsClient): Promise<void> {
        const path = window.location.pathname;
        const nonogramId = path.split("/")[2];
        return client.openNonogram(nonogramId);
    }
    
}