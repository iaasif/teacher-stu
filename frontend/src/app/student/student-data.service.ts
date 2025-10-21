import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AttendanceSummary {
  records: { date: string; is_present: boolean }[];
  summary: { present: number; absent: number };
}

@Injectable({ providedIn: 'root' })
export class StudentDataService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getOwnAttendance(): Observable<AttendanceSummary> {
    return this.http.get<AttendanceSummary>(`${this.baseUrl}/attendance/me`);
  }
}