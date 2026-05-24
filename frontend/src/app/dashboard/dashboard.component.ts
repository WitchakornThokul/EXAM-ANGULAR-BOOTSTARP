import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, ApiUser } from '../api.service';
import { AuthService, AuthUser } from '../auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <div class="hero card border-0 shadow-lg mb-4">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center">
                <div>
                  <p class="badge text-bg-dark mb-3">PHP + Angular + Bootstrap</p>
                  <h1 class="display-6 fw-bold mb-2">XAMPP starter for a CRUD web app</h1>
                  <p class="lead mb-0">
                    Angular reads data from the PHP API, and the PHP side connects to MySQL through phpMyAdmin.
                  </p>
                </div>
                <div class="text-md-end">
                  <div class="small text-uppercase text-muted">Signed in as</div>
                  <div class="fs-4 fw-semibold">{{ currentUser?.username || 'Guest' }}</div>
                  <button class="btn btn-outline-dark btn-sm mt-3" type="button" (click)="logout()">Logout</button>
                </div>
              </div>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h2 class="h5 mb-0">Users from phpMyAdmin / MySQL</h2>
              <button class="btn btn-dark btn-sm" type="button" (click)="loadData()">Refresh</button>
            </div>
            <div class="card-body">
              <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
              <div *ngIf="!errorMessage && users.length === 0" class="text-muted">No users found.</div>
              <div class="table-responsive" *ngIf="users.length > 0">
                <table class="table align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let user of users">
                      <td>{{ user.id }}</td>
                      <td>{{ user.username }}</td>
                      <td>{{ user.email }}</td>
                      <td>{{ user.created_at }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .hero {
        background: linear-gradient(135deg, #ffffff 0%, #e5eefc 100%);
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  users: ApiUser[] = [];
  currentUser: AuthUser | null = this.authService.getCurrentUser();
  healthMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (user?.role === 'admin') {
      this.router.navigateByUrl('/dashboard/admin');
      return;
    }

    this.router.navigateByUrl('/dashboard/customer');
  }

  loadData(): void {
    this.errorMessage = '';

    this.apiService.getHealth().subscribe({
      next: (response) => {
        this.healthMessage = response?.message ?? 'API is connected.';
      },
      error: () => {
        this.errorMessage = 'Unable to reach the PHP API.';
      },
    });

    this.apiService.getUsers().subscribe({
      next: (response) => {
        this.users = response.data;
      },
      error: () => {
        this.errorMessage = 'Unable to load users from MySQL.';
      },
    });
  }

  logout(): void {
    this.authService.clearSession();
    this.router.navigateByUrl('/login');
  }
}