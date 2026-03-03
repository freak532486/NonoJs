import NonojsClient from "../../../types/nonojs-client";
import Route from "../route";

export default class SettingsRoute implements Route
{

    matches(path: string): boolean {
        return path == "/settings";
    }

    async run(client: NonojsClient) {
        client.openSettings();
    }
    
}