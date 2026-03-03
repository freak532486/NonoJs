import NonojsClient from "../../../types/nonojs-client";
import { navigateTo } from "../../navigate-to";
import Route from "../route";

export default class ConfirmRegistrationRoute implements Route
{

    matches(path: string): boolean {
        return path == "/register/confirm";
    }

    async run(client: NonojsClient) {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (!token) {
            navigateTo("/");
            return;
        }
        
        return client.confirmRegistration(token);
    }
    
}