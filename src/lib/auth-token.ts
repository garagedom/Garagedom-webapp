// JWT em memória — sessão restaurada via cookie httpOnly de refresh token no init do app
let _token: string | null = null;

export const getToken = (): string | null => _token;
export const setToken = (token: string): void => { _token = token; };
export const clearToken = (): void => { _token = null; };
