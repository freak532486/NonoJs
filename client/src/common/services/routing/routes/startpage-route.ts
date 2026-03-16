import NonojsClient from "../../../types/nonojs-client";
import Route from "../route";

export default class StartpageRoute implements Route
{

    matches(path: string): boolean {
        return path == "/";
    }

    async run(client: NonojsClient) {
        return client.openStartPage();
    }
    
}