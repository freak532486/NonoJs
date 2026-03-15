import AuthService from "../../../../common/services/auth/auth-service";
import { navigateTo } from "../../../../common/services/navigate-to";

export default class DesktopLoginAction
{

    constructor(
        private readonly authService: AuthService,
        private readonly view: HTMLElement
    ) {}

    async run()
    {
        const msgSpan = this.view.querySelector(".msg") as HTMLSpanElement;

        const inputUsername = this.view.querySelector("#form-login input.username") as HTMLInputElement;
        const inputPassword = this.view.querySelector("#form-login input.password") as HTMLInputElement;

        const authResponse = await this.authService.login(inputUsername.value, inputPassword.value);

        if (authResponse.status == "bad_credentials") {
            msgSpan.classList.remove("success");
            msgSpan.classList.add("error");
            msgSpan.textContent = "Invalid credentials.";
        }

        if (authResponse.status == "error") {
            msgSpan.classList.remove("success");
            msgSpan.classList.add("error");
            msgSpan.textContent = "An error occured. Failed to login.";
        }

        if (authResponse.status == "ok") {
            navigateTo("/"); // Reload page, token was set by login.
        }
    }

}