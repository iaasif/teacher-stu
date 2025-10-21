import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/api.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [RouterLink]
})
export class DashboardComponent implements OnInit {
  totalStudents = 0;
  presentToday = 0;
  absentToday = 0;

  constructor(private api: ApiService) { }

  async ngOnInit() {
    const students: any = await this.api.getStudents(1, 1000, '').toPromise();
    this.totalStudents = students.data.length;

    const att: any = await this.api.getAttendance().toPromise();
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = att.filter((a: any) => a.date === today);
    this.presentToday = todayRecords.filter((a: any) => a.is_present).length;
    this.absentToday = todayRecords.length - this.presentToday;
  }
}