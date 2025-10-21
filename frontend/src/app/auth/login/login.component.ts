import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [FormsModule]
})
export class LoginComponent {
  role: 'teacher' | 'student' = 'teacher';
  showRegister = false;
  error = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) { }

  async login() {
    const u = (document.getElementsByName('u')[0] as any).value;
    const p = (document.getElementsByName('p')[0] as any).value;
    try {
      const res: any = await this.api[this.role === 'teacher' ? 'teacherLogin' : 'studentLogin']({ username: u, password: p }).toPromise();
      this.auth.login(res.token, res.user);
      this.router.navigate([this.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard']);
    } catch (e: any) {
      this.error = e?.error?.error || 'Login failed';
    }
  }

  async register() {
    const u = (document.getElementsByName('u')[0] as any).value;
    const e = (document.getElementsByName('e')[0] as any).value;
    const m = (document.getElementsByName('m')[0] as any).value;
    const p = (document.getElementsByName('p')[0] as any).value;
    try {
      const res: any = await this.api.teacherRegister({ username: u, email: e, mobile: m, password: p }).toPromise();
      alert('Registration successful! Please log in.');
      this.showRegister = false;
    } catch (e: any) {
      this.error = e?.error?.error || 'Registration failed';
    }
  }

  toggleMode() {
    this.showRegister = !this.showRegister;
    this.error = '';
  }
}