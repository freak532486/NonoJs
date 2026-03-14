import BoxComponent from "../../../common/components/box/box.component";
import { htmlToElement } from "../../../common/services/html-to-element";
import Color from "../../../common/types/color";
import UIComponent from "../../../common/types/ui-component";
import loggedInTemplate from "./logged-in.template.html";
import loggedOutTemplate from "./logged-out.template.html";
import "./logged-in.style.css"
import "./logged-out.style.css"
import DesktopLoginAction from "./actions/login";
import AuthService from "../../../common/services/auth/auth-service";
import DesktopLogoutAction from "./actions/logout";
import DesktopRegisterAction from "./actions/register";

export default class LoginBox implements UIComponent
{

    private readonly box;

    constructor(
        activeUsername: string | undefined,
        authService: AuthService,
        onRegister: (username: string, password: string, emailAddress: string) => void
    )
    {
        this.box = new BoxComponent("Log in", new Color(0, 128, 255));

        /* Logged out version. */
        if (activeUsername !== undefined) {
            const templateElement = htmlToElement(loggedInTemplate);
            const usernameSpans = templateElement.querySelectorAll(".username");
            usernameSpans.forEach(x => x.textContent = activeUsername);
            this.box.content.appendChild(templateElement);

            const logoutAction = new DesktopLogoutAction(authService);
            const btnLogout = templateElement.querySelector("#btn-logout") as HTMLButtonElement;
            btnLogout.onclick = () => logoutAction.run();

            return;
        }

        /* Logged in version */
        const templateElement = htmlToElement(loggedOutTemplate);
        this.box.content.appendChild(templateElement);

        const loginAction = new DesktopLoginAction(authService, templateElement);
        const loginForm = templateElement.querySelector("#form-login") as HTMLFormElement;
        loginForm.onsubmit = ev => {
            ev.preventDefault();
            loginAction.run();
        }

        const registerAction = new DesktopRegisterAction(authService, templateElement);
        const registerForm = templateElement.querySelector("#form-register") as HTMLFormElement;
        registerForm.onsubmit = ev => {
            ev.preventDefault();
            registerAction.run();
        }
    }

    create(parent: HTMLElement): HTMLElement {
        return this.box.create(parent);
    }

    cleanup(): void {
        // Nothing to do
    }
    
}