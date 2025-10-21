import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms'; // ← ADD THIS

export interface Student {
  id: number;
  username: string;
  email: string;
  mobile: string;
  name: string;
  is_active: boolean;
}

export interface AttendanceRecord {
  student_id: number;
  date: string;
  is_present: boolean;
}

@Injectable({ providedIn: 'root' })
export class TeacherDataService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/students`).pipe(
      catchError(() => of([])) // fallback to empty array on error
    );
  }

  getAttendance(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.baseUrl}/attendance`).pipe(
      catchError(() => of([]))
    );
  }
}