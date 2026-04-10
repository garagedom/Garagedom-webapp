// JWT singleton in module memory — never persisted to localStorage, sessionStorage, or JS-accessible cookie
let _token: string | null = null;

export const getToken = (): string | null => _token;
export const setToken = (token: string): void => { _token = token; };
export const clearToken = (): void => { _token = null; };
