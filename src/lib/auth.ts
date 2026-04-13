import { Role } from "@/types/petcare";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
}

const AUTH_TOKEN_KEY = "petcare_auth_token";
const AUTH_USER_KEY = "petcare_auth_user";

export const setAuthSession = (token: string, user: AuthUser): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  window.sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const isAuthSessionActive = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return !!window.sessionStorage.getItem(AUTH_TOKEN_KEY);
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage.getItem(AUTH_TOKEN_KEY);
};

export const getAuthUser = (): AuthUser | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const userJson = window.sessionStorage.getItem(AUTH_USER_KEY);
  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(userJson) as AuthUser;
  } catch {
    return null;
  }
};

export const clearAuthSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_USER_KEY);
};
