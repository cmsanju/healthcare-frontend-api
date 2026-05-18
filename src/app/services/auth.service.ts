import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://healthcare-backend-vgnh.onrender.com/api/auth';
  private isAuthSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        localStorage.setItem('email', res.email);
        localStorage.setItem('fullName', res.fullName || '');
        this.isAuthSubject.next(true);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        localStorage.setItem('email', res.email);
        localStorage.setItem('fullName', res.fullName || '');
        this.isAuthSubject.next(true);
      })
    );
  }

  logout() {
    localStorage.clear();
    this.isAuthSubject.next(false);
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  getFullName(): string {
    return localStorage.getItem('fullName') || this.getUsername();
  }

  hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}
