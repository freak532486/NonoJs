export default interface TokenRepository {
    getSessionToken(): string | undefined,
    setSessionToken(token: string): void,
    getRefreshToken(): string | undefined,
    setRefreshToken(token: string): void;
}