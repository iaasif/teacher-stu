import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  get user() {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  login(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    localStorage.clear();
    location.href = '/login';
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }
}