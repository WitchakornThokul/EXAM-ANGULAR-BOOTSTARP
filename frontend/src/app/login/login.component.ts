import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .login-wrap { min-height: 100vh; background: #f8f9fa; display: flex; align-items: center; justify-content: center; }
    .login-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 40px; width: 100%; max-width: 400px; }
    .brand { font-size: 20px; font-weight: 700; color: #212529; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
    .brand-sub { font-size: 13px; color: #6c757d; margin-bottom: 28px; }
    .field-label { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .field-input { width: 100%; padding: 10px 14px; font-size: 14px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; color: #212529; box-sizing: border-box; }
    .field-input:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .btn-primary-custom { width: 100%; padding: 11px; font-size: 14px; font-weight: 600; background: #212529; color: #fff; border: none; border-radius: 8px; cursor: pointer; margin-top: 8px; }
    .btn-primary-custom:hover { background: #374151; }
    .btn-primary-custom:disabled { background: #9ca3af; cursor: not-allowed; }
    .btn-success-custom { width: 100%; padding: 11px; font-size: 14px; font-weight: 600; background: #059669; color: #fff; border: none; border-radius: 8px; cursor: pointer; margin-top: 8px; }
    .btn-success-custom:hover { background: #047857; }
    .btn-success-custom:disabled { background: #9ca3af; cursor: not-allowed; }
    .error-box { font-size: 13px; color: #b91c1c; background: #fde8e8; border-radius: 8px; padding: 10px 14px; margin-top: 12px; }
    .toggle-link { font-size: 13px; color: #6c757d; text-align: center; margin-top: 20px; }
    .toggle-link a { color: #2563eb; text-decoration: none; cursor: pointer; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 20px 0; }
    .mb-16 { margin-bottom: 16px; }
  `],
  template: `
    <div class="login-wrap">
      <div class="login-card">

        <div class="brand">
          <i class="bi bi-bag-heart"></i> MyStore
        </div>
        <div class="brand-sub">{{ isRegisterMode ? 'สร้างบัญชีใหม่' : 'เข้าสู่ระบบเพื่อดำเนินการต่อ' }}</div>

        <form *ngIf="!isRegisterMode" [formGroup]="loginForm" (ngSubmit)="submit()" novalidate>
          <div class="mb-16">
            <div class="field-label">Username</div>
            <input class="field-input" type="text" formControlName="username" placeholder="กรอก username" />
          </div>
          <div class="mb-16">
            <div class="field-label">Password</div>
            <input class="field-input" type="password" formControlName="password" placeholder="กรอก password" />
          </div>
          <div *ngIf="errorMessage" class="error-box">{{ errorMessage }}</div>
          <button class="btn-primary-custom" type="submit" [disabled]="loginForm.invalid || isSubmitting">
            {{ isSubmitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </form>

        <form *ngIf="isRegisterMode" [formGroup]="registerForm" (ngSubmit)="register()" novalidate>
          <div class="mb-16">
            <div class="field-label">Username</div>
            <input class="field-input" type="text" formControlName="username" placeholder="กรอก username" />
          </div>
          <div class="mb-16">
            <div class="field-label">Email</div>
            <input class="field-input" type="email" formControlName="email" placeholder="you@example.com" />
          </div>
          <div class="mb-16">
            <div class="field-label">Password</div>
            <input class="field-input" type="password" formControlName="password" placeholder="อย่างน้อย 6 ตัวอักษร" />
          </div>
          <div *ngIf="errorMessage" class="error-box">{{ errorMessage }}</div>
          <button class="btn-success-custom" type="submit" [disabled]="registerForm.invalid || isSubmitting">
            {{ isSubmitting ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี' }}
          </button>
        </form>

        <hr class="divider" />
        <div class="toggle-link">
          <a (click)="toggleMode()">
            {{ isRegisterMode ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก' }}
          </a>
        </div>

      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  isSubmitting = false;
  errorMessage = '';
  isRegisterMode = false;

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  registerForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    this.http.post<{ status: string; message: string; user?: AuthUser }>(
      'http://localhost/exam/backend/api/login.php',
      this.loginForm.getRawValue()
    ).subscribe({
      next: (response) => {
        if (!response.user) {
          this.errorMessage = response.message || 'Login failed.';
          this.isSubmitting = false;
          return;
        }
        this.authService.setCurrentUser(response.user);
        this.router.navigateByUrl('/dashboard');
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to sign in.';
        this.isSubmitting = false;
      },
    });
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.isSubmitting = false;
  }

  register(): void {
    if (this.registerForm.invalid || this.isSubmitting) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    this.http.post<{ status: string; message?: string }>(
      'http://localhost/exam/backend/api/register.php',
      this.registerForm.getRawValue()
    ).subscribe({
      next: (res) => {
        if (res.status !== 'ok') {
          this.errorMessage = res.message || 'Registration failed.';
          this.isSubmitting = false;
          return;
        }
        this.registerForm.reset();
        this.isSubmitting = false;
        this.isRegisterMode = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Unable to create account.';
        this.isSubmitting = false;
      },
    });
  }
}