import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Student, NewStudent } from '../../shared/models';

@Component({
  selector: 'app-student-form',
  templateUrl: './student-form.component.html',
  imports: [FormsModule]
})
export class StudentFormComponent implements OnInit {
  @Input() student: Student | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Student | NewStudent>();

  formData: Partial<Student> & { password?: string } = {
    username: '',
    email: '',
    mobile: '',
    name: '',
    password: ''
  };

  errors: string[] = [];
  isSubmitting = false;

  ngOnInit() {
    if (this.student) {
      this.formData = { ...this.student };
      delete this.formData.password;
      this.formData = {
        username: '',
        email: '',
        mobile: '',
        name: '',
        password: ''
      };
    }
  }

  validate() {
    const errs: string[] = [];

    if (!this.formData.username || this.formData.username.length < 3) {
      errs.push('Username must be at least 3 characters');
    }
    if (!this.formData.email || !/\S+@\S+\.\S+/.test(this.formData.email)) {
      errs.push('Valid email is required');
    }
    const cleanMobile = (this.formData.mobile || '').replace(/\D/g, '');
    if (!/^\d{10,15}$/.test(cleanMobile)) {
      errs.push('Mobile must be 10–15 digits');
    }
    if (!this.formData.name?.trim()) {
      errs.push('Name is required');
    }
    if (!this.student && (!this.formData.password || this.formData.password.length < 6)) {
      errs.push('Password must be at least 6 characters');
    }

    return errs;
  }

  onSubmit() {
    this.errors = this.validate();
    if (this.errors.length > 0) return;

    const cleanMobile = (this.formData.mobile || '').replace(/\D/g, '');

    if (this.student) {
      const payload: Student = {
        id: this.student.id,
        username: this.formData.username!,
        email: this.formData.email!,
        mobile: cleanMobile,
        name: this.formData.name!,
        is_active: this.student.is_active
      };
      this.save.emit(payload);
    } else {
      const payload: NewStudent = {
        username: this.formData.username!,
        email: this.formData.email!,
        mobile: cleanMobile,
        name: this.formData.name!,
        password: this.formData.password!
      };
      this.save.emit(payload);
    }

    this.isSubmitting = false;
  }

  onClose() {
    this.close.emit();
  }
}