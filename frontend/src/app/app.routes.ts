import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./auth/login/login.component').then(c => c.LoginComponent) },
    {
        path: 'teacher',
        children: [
            { path: 'dashboard', loadComponent: () => import('./teacher/dashboard/dashboard.component').then(c => c.DashboardComponent) },
            { path: 'students', loadComponent: () => import('./teacher/students/students.component').then(c => c.StudentsComponent) },
        ]
    },
    {
        path: 'student',
        children: [
            { path: 'dashboard', loadComponent: () => import('./student/dashboard/dashboard.component').then(c => c.DashboardComponent) }
        ]
    }
];