import TokenRepository from "../types/token-repository";

const tokenRepository: TokenRepository = {
    getSessionToken() {
        return _getSessionToken();
    },

    setSessionToken(token: string) {
        _setSessionToken(token);
    },

    getRefreshToken() {
        return _getRefreshToken();
    },

    setRefreshToken(token: string) {
        _setRefreshToken(token);
    }
}

export default tokenRepository;

function _getSessionToken(): string | undefined {
    return readCookie("sessionToken");
}

function _setSessionToken(token: string) {
    writeCookie("sessionToken", token, 60 * 60); // 1 hour expiry.
}

function _getRefreshToken(): string | undefined {
    return readCookie("refreshToken");
}

function _setRefreshToken(token: string) {
    writeCookie("refreshToken", token, 7 * 24 * 60 * 60); // 7 days expiry.
}

function readCookie(key: string): string | undefined {
    const encodedKey = encodeURIComponent(key) + "=";
    const parts = document.cookie.split("; ");

    for (const part of parts) {
        if (part.startsWith(encodedKey)) {
            return decodeURIComponent(part.substring(encodedKey.length));
        }
    }

    return undefined;
}

function writeCookie(key: string, value: string, maxAgeSeconds: number): void {
    const params = "Path=/; SameSite=Strict; Max-Age=" + maxAgeSeconds;
    document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + "; " + params;
}