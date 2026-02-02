import * as headerParsing from "./impl/header-parsing";
import { getUserById } from "./impl/auth-sql";
import { confirmRegistration, performUnconfirmedRegistration } from "./impl/registration";
import { getUserIdForSession } from "./internal/utils";
import { performLogin } from "./impl/login";
import { refreshSession } from "./impl/session-refresh";

const auth = {
    parseBasicAuthHeader: headerParsing.parseBasicAuthHeader,
    parseBearerAuthHeader: headerParsing.parseBearerAuthHeader,

    getUserById: getUserById,
    getUserIdForSession: getUserIdForSession,

    refreshSession: refreshSession,

    login: performLogin,
    performUnconfirmedRegistration: performUnconfirmedRegistration,
    confirmRegistration: confirmRegistration
}

export default auth;