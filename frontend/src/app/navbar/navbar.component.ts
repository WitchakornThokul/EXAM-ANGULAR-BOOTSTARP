import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .navbar { border-bottom: 1px solid #e5e7eb !important; }
    .navbar-brand { font-weight: 700; font-size: 16px; color: #212529 !important; letter-spacing: -0.3px; }
    .nav-link { font-size: 13px; color: #6c757d !important; }
    .nav-link:hover { color: #212529 !important; }
    .avatar-chip { width: 32px; height: 32px; border-radius: 50%; background: #e6f1fb; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #185fa5; }
    .role-badge { font-size: 10px; padding: 2px 7px; border-radius: 20px; background: #f3f4f6; color: #6c757d; font-weight: 500; }
    .role-badge.admin { background: #fde8e8; color: #b91c1c; }
  `],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white">
      <div class="container">
        <a class="navbar-brand" [routerLink]="homeLink()">
          <i class="bi bi-bag-heart me-1"></i>MyStore
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="nav-link" [routerLink]="homeLink()">หน้าหลัก</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/products">สินค้า</a></li>
            <li class="nav-item"><a class="nav-link" routerLink="/coupons">คูปอง</a></li>
          </ul>

          <ul class="navbar-nav ms-auto align-items-center gap-2">

            <li class="nav-item" *ngIf="!user">
              <a class="btn btn-outline-primary btn-sm" routerLink="/login">เข้าสู่ระบบ</a>
            </li>

            <li class="nav-item d-flex align-items-center gap-2" *ngIf="user">
              <a class="nav-link position-relative p-1" routerLink="/cart">
                <i class="bi bi-bag" style="font-size:18px;"></i>
                <span *ngIf="cartCount > 0"
                  class="position-absolute badge rounded-pill bg-danger"
                  style="top:-4px;right:-6px;font-size:10px;padding:2px 5px;">
                  {{ cartCount }}
                </span>
              </a>
              <a routerLink="/orders" class="nav-link p-1">
                <i class="bi bi-receipt" style="font-size:18px;"></i>
              </a>
              <a routerLink="/profile" class="nav-link p-1">
                <div class="avatar-chip">{{ user.username?.charAt(0)?.toUpperCase() }}</div>
              </a>
              <span class="role-badge" [class.admin]="user.role === 'admin'">{{ user.role }}</span>
              <button class="btn btn-outline-danger btn-sm" type="button" (click)="logout()">
                <i class="bi bi-box-arrow-right"></i>
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private userSubscription?: Subscription;

  user = this.auth.getCurrentUser();
  cartCount = 0;

  ngOnInit() {
    this.userSubscription = this.auth.currentUser$.subscribe((user) => {
      this.user = user;
      this.cartCount = 0;
      this.loadCart();
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  loadCart() {
    if (!this.user) return;
    this.api.customerDashboard(this.user.username).subscribe({
      next: (res) => (this.cartCount = res.cart_count ?? 0)
    });
  }

  homeLink(): string {
    if (!this.user) return '/login';
    return this.user.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer';
  }

  logout() {
    this.auth.clearSession();
    this.router.navigateByUrl('/login');
  }
}