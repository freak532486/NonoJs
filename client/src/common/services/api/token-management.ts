/**
 * Returns the active session token, or undefined if there is none.
 */
export function getSessionToken(): string | undefined {
    return window.localStorage.getItem("sessionToken") || undefined;
}

/**
 * Sets the active session token.
 */
export function setSessionToken(token: string | undefined) {
    if (!token) {
        window.localStorage.removeItem("sessionToken");
        return;
    }

    return window.localStorage.setItem("sessionToken", token);
}

/**
 * Returns the active refresh token, or undefined if there is none.
 */
export function getRefreshToken(): string | undefined {
    return window.localStorage.getItem("refreshToken") || undefined;
}

/**
 * Sets the active refresh token.
 */
export function setRefreshToken(token: string | undefined) {
    if (!token) {
        window.localStorage.removeItem("refreshToken");
        return;
    }

    return window.localStorage.setItem("refreshToken", token);
}

/**
 * Clears all stored tokens.
 */
export function clearTokens()
{
    setSessionToken(undefined);
    setRefreshToken(undefined);
}