import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AttendanceSummary, LoginLog, NewStudent, Student } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  teacherLogin(data: { username: string; password: string }) {
    return this.http.post(`${this.api}/auth/login`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  studentLogin(data: { username: string; password: string }) {
    return this.http.post(`${this.api}/auth/student-login`, data,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  teacherRegister(data: { username: string; email: string; mobile: string; password: string }) {
    return this.http.post(`${this.api}/auth/register`, data);
  }
  getStudents(page: number, limit: number, search: string) {
    let url = `${this.api}/students?page=${page}&limit=${limit}`;
    if (search) url += `&search=${search}`;
    return this.http.get(url);
  }
  addStudent(student: NewStudent) {
    return this.http.post(`${this.api}/students`, student);
  }
  updateStudent(id: number, student: Student) {
    return this.http.put(`${this.api}/students/${id}`, student);
  }
  deactivateStudent(id: number) {
    return this.http.delete(`${this.api}/students/${id}`);
  }
  uploadCSV(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${this.api}/students/upload`, fd);
  }
  downloadCSV() {
    window.open(`${this.api}/students/download`, '_blank');
  }

  getOwnAttendance() {
    return this.http.get<AttendanceSummary>(`${this.api}/attendance/me`);
  }
  markAttendance() {
    return this.http.post(`${this.api}/attendance/mark`, {});
  }
  getAttendance() {
    return this.http.get(`${this.api}/attendance`);
  }

  getLoginLogs() {
    return this.http.get<LoginLog[]>(`${this.api}/logs`);
  }

}