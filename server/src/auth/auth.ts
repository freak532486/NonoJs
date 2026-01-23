import performLogin from "./impl/login";
import { checkIfUserExists, registerUser } from "./impl/register";
import refreshTokenForUser from "./impl/token-refresh";

const auth = {
    performLogin,
    registerUser,
    checkIfUserExists,
    refreshTokenForUser
}

export default auth;