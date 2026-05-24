import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost/exam/backend/api';

  constructor(private readonly http: HttpClient) {}

  getHealth(): Observable<{ status: string; message?: string; time?: string }> {
    return this.http.get<{ status: string; message?: string; time?: string }>(`${this.baseUrl}/health.php`);
  }

  getUsers(): Observable<{ status: string; data: ApiUser[] }> {
    return this.http.get<{ status: string; data: ApiUser[] }>(`${this.baseUrl}/users.php`);
  }

  register(payload: { username: string; email: string; password: string }) {
    return this.http.post<{ status: string; message?: string }>(`${this.baseUrl}/register.php`, payload);
  }

  adminStats() {
    return this.http.get<{ status: string; kpis: any; action_orders: any[]; recent_reviews: any[] }>(`${this.baseUrl}/admin_stats.php`);
  }

  customerDashboard(username: string) {
    return this.http.post<{ status: string; user: any; status_counts: any; recent_orders: any[]; coupons: any[]; cart_count: number; recommended: any[] }>(`${this.baseUrl}/customer_dashboard.php`, { username });
  }
}