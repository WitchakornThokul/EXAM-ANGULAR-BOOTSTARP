import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

const AUTH_STORAGE_KEY = 'exam-auth-user';
const LEGACY_AUTH_STORAGE_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.readUserFromStorage());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  private readUserFromStorage(): AuthUser | null {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY) ?? localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as AuthUser;
    } catch {
      return null;
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  setCurrentUser(user: AuthUser): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(LEGACY_AUTH_STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  clearSession(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    this.currentUserSubject.next(null);
  }
}