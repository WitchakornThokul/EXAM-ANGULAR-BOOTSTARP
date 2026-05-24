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
  template: `
    <div class="login-shell min-vh-100 d-flex align-items-center">
      <div class="container py-5">
        <div class="row justify-content-center align-items-stretch g-0">
          <div class="col-12 col-lg-5">
            <div class="brand-panel h-100 p-4 p-md-5 text-white">
              <h1 class="display-6 fw-bold">Ecommerce</h1>
            </div>
          </div>

          <div class="col-12 col-lg-5">
            <div class="card shadow-lg border-0 rounded-4 h-100">
              <div class="card-body p-4 p-md-5">
                <h2 class="h4 fw-bold mb-2">{{ isRegisterMode ? 'Register' : 'Login' }}</h2>

                <form *ngIf="!isRegisterMode" [formGroup]="loginForm" (ngSubmit)="submit()" novalidate>
                  <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input class="form-control form-control-lg" type="text" formControlName="username" placeholder="admin" />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input class="form-control form-control-lg" type="password" formControlName="password" placeholder="password" />
                  </div>

                  <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

                  <button class="btn btn-dark btn-lg w-100" type="submit" [disabled]="loginForm.invalid || isSubmitting">
                    {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
                  </button>
                </form>

                <form *ngIf="isRegisterMode" [formGroup]="registerForm" (ngSubmit)="register()" novalidate>
                  <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input class="form-control form-control-lg" type="text" formControlName="username" placeholder="new user" />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input class="form-control form-control-lg" type="email" formControlName="email" placeholder="you@example.com" />
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input class="form-control form-control-lg" type="password" formControlName="password" placeholder="min 6 chars" />
                  </div>

                  <div *ngIf="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

                  <button class="btn btn-success btn-lg w-100" type="submit" [disabled]="registerForm.invalid || isSubmitting">
                    {{ isSubmitting ? 'Creating...' : 'Create account' }}
                  </button>
                </form>

                <div class="mt-3 text-center small">
                  <a href="javascript:void(0)" (click)="toggleMode()">{{ isRegisterMode ? 'Already have an account? Sign in' : 'No account? Register' }}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-shell {
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 30%),
          linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
      }

      .brand-panel {
        border-radius: 1.5rem 0 0 1.5rem;
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.7));
        min-height: 100%;
      }

      @media (max-width: 991.98px) {
        .brand-panel {
          border-radius: 1.5rem 1.5rem 0 0;
        }
      }
    `,
  ],
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

    this.http
      .post<{ status: string; message: string; user?: AuthUser }>('http://localhost/exam/backend/api/login.php', this.loginForm.getRawValue())
      .subscribe({
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

    this.http.post<{ status: string; message?: string }>('http://localhost/exam/backend/api/register.php', this.registerForm.getRawValue()).subscribe({
      next: (res) => {
        if (res.status !== 'ok') {
          this.errorMessage = res.message || 'Registration failed.';
          this.isSubmitting = false;
          return;
        }

        // on success, switch to login mode
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