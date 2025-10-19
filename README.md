# Teacher–Student Management Application

A full-stack web application for teachers to manage students and attendance, and for students to track their own records.

## ✅ Features

### Teacher Module
- Register & login (JWT auth)
- Dashboard: Total Students, Present/Absent Today
- Student CRUD (Add, Edit, Deactivate)
- CSV Upload with duplicate validation
- Download student list as CSV
- View attendance records
- Login activity logs

### Student Module
- Login (active students only)
- Dashboard: Total Present/Absent Days
- Mark daily attendance
- View own login logs
- Edit profile

## 🛠️ Tech Stack

- **Frontend**: Angular 19 + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: JWT + Bcrypt
- **Validation**: Zod
- **Deployment**: Docker

## 🚀 Setup & Run

### Prerequisites
- [Docker](https://docker.com) installed

### Steps
1. Clone the repo:
   ```bash
   git clone git@github.com:iaasif/teacher-stu.git
   cd teacher-stu