import NonojsClient from "../../../types/nonojs-client";
import Route from "../route";

export default class LoginRoute implements Route
{

    matches(path: string): boolean {
        return path == "/login";
    }

    run(client: NonojsClient) {
        client.openLogin();
    }
    
}