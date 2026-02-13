import Route from "../route";
import * as apiClient from "../../api/api-client"
import * as app from "../../app"
import UIComponent from "../../common/ui-component";
import RegistrationConfirmationComponent from "../../auth/components/registration-confirmation/registration-confirmation.component";
import ActiveComponentManager from "../../active-component-manager";

export default class ConfirmRegistrationRoute implements Route
{
    constructor(
        private readonly activeComponentManager: ActiveComponentManager
    ) {}

    matches(path: string): boolean {
        return path == "/register/confirm";
    }

    async run(path: string) {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (!token) {
            app.navigateTo("/");
            return;
        }

        const component = await this.#buildConfirmationPage(token);
        this.activeComponentManager.setActiveComponent(component);
    }

    async #buildConfirmationPage(token: string): Promise<UIComponent>
    {
        /* Create display component */
        const component = new RegistrationConfirmationComponent();

        /* Send confirmation request to server */
        const request = new Request("/api/auth/confirm-registration?token=" + token, {
            method: "GET",
        });
        const response = await apiClient.performRequest(request);

        switch (response.status) {
            case "ok":
                component.setTitle("Success");
                component.setMessage("Confirmation successful. You can now log in with your new username.");
                break;

            case "bad_response":
                component.setTitle("Error");
                if (response.data.status == 404) {
                    component.setMessage("Unknown registration token.");
                } else if (response.data.status == 409) {
                    component.setMessage("Someone has registered your username while your confirmation was pending. Please choose a different username.");
                } else {
                    component.setMessage("An unknown error occured.");
                }
                break;

            case "unauthorized":
            case "error":
                component.setTitle("Error");
                component.setMessage("An error occured");
                break;
        }

        return component;
    }
    
}