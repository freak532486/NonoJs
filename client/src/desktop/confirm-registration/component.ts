import template from "./template.html"
import "./style.css"
import * as apiClient from "../../common/services/api/api-client"
import AuthService from "../../common/services/auth/auth-service";
import UIComponent from "../../common/types/ui-component";
import { htmlToElement } from "../../common/services/html-to-element";


export default class DesktopConfirmRegistrationPage implements UIComponent
{
    private readonly view: HTMLElement;

    constructor(
        private readonly token: string
    )
    {
        this.view = htmlToElement(template);
    }

    async create(parent: HTMLElement): Promise<HTMLElement>
    {
        parent.appendChild(this.view);

        /* Try confirming token */
        const request = new Request("/api/auth/confirm-registration?token=" + this.token, {
            method: "GET",
        });
        const response = await apiClient.performRequest(request);

        /* Build page depending on response */
        const msgSpan = this.view.querySelector("#msg") as HTMLSpanElement;

        if (response.status == "ok") {
            msgSpan.textContent = "Your registration was successfully confirmed! Return to the start page and log in with your new username.";
            return this.view;
        }

        if (response.status == "bad_response" && response.data.status == 404) {
            msgSpan.textContent = "Unknown registration token.";
            return this.view;
        }

        if (response.status == "bad_response" && response.data.status == 409) {
            msgSpan.textContent = "Someone else has registered your username before you confirmed your registration. Please choose a different username.";
            return this.view;
        }

        /* Done */
        msgSpan.textContent = "An error occurred when confirming this registration token. Try to register again.";
        return this.view;
    }

    cleanup(): Promise<void> | void {
        throw new Error("Method not implemented.");
    }
}