export interface Student {
    id?: number;
    username: string;
    email: string;
    mobile: string;
    name: string;
    is_active?: boolean;
}

export interface NewStudent {
    username: string;
    email: string;
    mobile: string;
    name: string;
    password: string;
}

export interface AttendanceSummary {
    summary: { present: number; absent: number };
}

export interface LoginLog {
    login_time: string;
    ip_address: string;
}