import AuthService from "../../../../common/services/auth/auth-service";

export default class DesktopRegisterAction {

    constructor(
        private readonly authService: AuthService,
        private readonly view: HTMLElement
    ) {}

    async run() {
        const msgSpan = this.view.querySelector(".msg") as HTMLSpanElement;

        const inputUsername = this.view.querySelector("#form-register .username") as HTMLInputElement;
        const inputEmail = this.view.querySelector("#form-register .email") as HTMLInputElement;
        const inputPassword = this.view.querySelector("#form-register .password") as HTMLInputElement;
        const inputConfirmPassword = this.view.querySelector("#form-register .password-confirm") as HTMLInputElement;

        if (inputPassword.value !== inputConfirmPassword.value) {
            msgSpan.classList.remove("success");
            msgSpan.classList.add("error");
            msgSpan.textContent = "Passwords are not equal.";
            return;
        }

        const username = inputUsername.value;
        const password = inputPassword.value;
        const emailAddress = inputEmail.value;

        const registerResponse = await this.authService.registerUser(username, password, emailAddress);

        if (registerResponse.status == "ok") {
            msgSpan.classList.remove("error");
            msgSpan.classList.add("success");
            msgSpan.textContent = "A confirmation mail has been sent to your email address.";
            return;
        }

        msgSpan.classList.add("error");
        msgSpan.classList.remove("success");

        if (registerResponse.status == "user_exists") {
            msgSpan.textContent = "An user with that username already exists.";
        }

        if (registerResponse.status == "error") {
            msgSpan.textContent = "An error occured. Registering a new user failed.";
        }

        if (registerResponse.status == "invalid_auth") {
            msgSpan.textContent = "Username and password must only contain ASCII characters (no emojis, no foreign characters).";
        }
    }

}