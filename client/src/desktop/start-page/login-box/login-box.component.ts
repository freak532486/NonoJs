import BoxComponent from "../../../common/components/box/box.component";
import { htmlToElement } from "../../../common/services/html-to-element";
import Color from "../../../common/types/color";
import UIComponent from "../../../common/types/ui-component";
import loggedInTemplate from "./logged-in.template.html";
import loggedOutTemplate from "./logged-out.template.html";
import "./logged-in.style.css"
import "./logged-out.style.css"

export default class LoginBox implements UIComponent
{

    private readonly box;

    constructor(
        activeUsername: string | undefined,
        onLogin: (username: string, password: string) => void,
        onRegister: (username: string, password: string, emailAddress: string) => void
    )
    {
        this.box = new BoxComponent("Log in", new Color(0, 128, 255));

        if (activeUsername !== undefined) {
            const templateElement = htmlToElement(loggedInTemplate);
            const usernameSpans = templateElement.querySelectorAll(".username");
            usernameSpans.forEach(x => x.textContent = activeUsername);
            this.box.content.appendChild(templateElement);
            return;
        }

        const templateElement = htmlToElement(loggedOutTemplate);
        this.box.content.appendChild(templateElement);
        
        const spanMsg = templateElement.querySelector(".msg") as HTMLElement;
        const loginForm = templateElement.querySelector("#form-login") as HTMLFormElement;
        loginForm.onsubmit = ev => {
            ev.preventDefault();

            const inputUsername = loginForm.querySelector(".username") as HTMLInputElement;
            const inputPassword = loginForm.querySelector(".password") as HTMLInputElement;
            onLogin(inputUsername.value, inputPassword.value);
        }

        const registerForm = templateElement.querySelector("#form-register") as HTMLFormElement;
        registerForm.onsubmit = ev => {
            ev.preventDefault();

            const inputUsername = registerForm.querySelector(".username") as HTMLInputElement;
            const inputEmail = registerForm.querySelector(".email") as HTMLInputElement;
            const inputPassword = registerForm.querySelector(".password") as HTMLInputElement;
            const inputConfirmPassword = registerForm.querySelector(".password-confirm") as HTMLInputElement;

            if (inputPassword.value !== inputConfirmPassword.value) {
                spanMsg.classList.remove("success");
                spanMsg.classList.add("error");
                spanMsg.textContent = "Passwords are not equal.";
                return;
            }

            onRegister(inputUsername.value, inputPassword.value, inputEmail.value);
        }
    }

    create(parent: HTMLElement): HTMLElement {
        return this.box.create(parent);
    }

    cleanup(): void {
        // Nothing to do
    }
    
}