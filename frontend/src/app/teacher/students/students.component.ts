import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html'
})
export class StudentsComponent implements OnInit {
  students: any[] = [];
  page = 1;
  limit = 10;
  search = '';

  constructor(private api: ApiService) { }

  async ngOnInit() {
    this.load();
  }



  async load() {
    try {
      const res: any = await this.api.getStudents(this.page, this.limit, this.search).toPromise();
      this.students = res.data;
    } catch (err) {
      console.error('Load failed:', err);
      alert('Failed to load students');
    }
  }

  add() {
    location.href = '/teacher/students/add';
  }

  edit(s: any) {
    location.href = `/teacher/students/edit/${s.id}`;
  }

  async deactivate(id: number) {
    if (confirm('Deactivate student?')) {
      await this.api.deactivateStudent(id).toPromise();
      this.load();
    }
  }

  async upload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const res: any = await this.api.uploadCSV(file).toPromise();
      alert(res.message);
      this.load();
    } catch (e: any) {
      alert(e?.error?.error || 'Upload failed');
    }
  }

  download() {
    this.api.downloadCSV();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.load();
    }
  }

  nextPage() {
    this.page++;
    this.load();
  }

  onLimitChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.limit = Number(target.value);
    this.page = 1;
    this.load();
  }
}