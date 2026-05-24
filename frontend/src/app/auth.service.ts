import { Injectable } from '@angular/core';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

const AUTH_STORAGE_KEY = 'exam-auth-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getCurrentUser(): AuthUser | null {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as AuthUser;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  setCurrentUser(user: AuthUser): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }

  clearSession(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}