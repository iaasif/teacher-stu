import { Routes } from '@angular/router';

export const teacherRoutes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'students',
        loadComponent: () => import('./students/students.component').then(m => m.StudentsComponent)
    },
    {
        path: 'attendance',
        loadComponent: () => import('./attendance/attendance.component').then(m => m.AttendanceComponent)
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];