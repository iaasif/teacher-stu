import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  present = 0;
  absent = 0;

  constructor(private api: ApiService) { }

  async ngOnInit() {
    const res: any = await this.api.getOwnAttendance().toPromise();
    this.present = res.summary.present;
    this.absent = res.summary.absent;
  }

  async mark() {
    try {
      await this.api.markAttendance().toPromise();
      alert('Attendance marked!');
      this.ngOnInit();
    } catch (e: any) {
      alert(e?.error?.error || 'Failed to mark');
    }
  }
}