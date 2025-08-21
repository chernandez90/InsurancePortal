import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next({
            username: response.username,
            email: response.email,
            role: response.role,
          });
        })
      );
  }

  register(credentials: RegisterDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.tokenSubject.next(response.token);
          this.currentUserSubject.next({
            username: response.username,
            email: response.email,
            role: response.role,
          });
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Allow other components/services to update the current user state
  setCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
  }

  // Snapshot of current user (useful for merging updates)
  getCurrentUserSnapshot(): any {
    return this.currentUserSubject.getValue();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
