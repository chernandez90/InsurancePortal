import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginDto } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login to Insurance Portal</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="form-control"
              placeholder="Enter your username"
            />
            <div
              *ngIf="
                loginForm.get('username')?.invalid &&
                loginForm.get('username')?.touched
              "
              class="error-message"
            >
              Username is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-control"
              placeholder="Enter your password"
            />
            <div
              *ngIf="
                loginForm.get('password')?.invalid &&
                loginForm.get('password')?.touched
              "
              class="error-message"
            >
              Password is required
            </div>
          </div>

          <div *ngIf="errorMessage" class="alert error">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button
              type="submit"
              [disabled]="!loginForm.valid || loading"
              class="btn-primary"
            >
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </div>

          <div class="register-link">
            Don't have an account?
            <button type="button" (click)="goToRegister()" class="link-button">
              Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
        background-color: #f5f5f5;
      }
      .login-card {
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }
      h2 {
        text-align: center;
        margin-bottom: 30px;
        color: #333;
      }
      .form-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #555;
      }
      .form-control {
        width: 100%;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        box-sizing: border-box;
      }
      .form-control:focus {
        outline: none;
        border-color: #007bff;
      }
      .error-message {
        color: #dc3545;
        font-size: 14px;
        margin-top: 5px;
      }
      .alert {
        padding: 12px;
        border-radius: 4px;
        margin-bottom: 20px;
      }
      .alert.error {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
      }
      .btn-primary {
        width: 100%;
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        background-color: #007bff;
        color: white;
      }
      .btn-primary:hover:not(:disabled) {
        background-color: #0056b3;
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .register-link {
        text-align: center;
        margin-top: 20px;
        color: #666;
      }
      .link-button {
        background: none;
        border: none;
        color: #007bff;
        cursor: pointer;
        text-decoration: underline;
      }
      .link-button:hover {
        color: #0056b3;
      }
    `,
  ],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const credentials: LoginDto = this.loginForm.value;

      console.log('🔐 Attempting login...', credentials);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('✅ Login successful:', response);
          this.loading = false;

          console.log('🚀 Attempting navigation to dashboard...');
          this.router
            .navigate(['/dashboard'])
            .then((success) => {
              console.log('🎯 Navigation result:', success);
              if (success) {
                console.log('✅ Navigation successful!');
              } else {
                console.error('❌ Navigation failed - trying window.location');
                window.location.href = '/dashboard';
              }
            })
            .catch((error) => {
              console.error('❌ Navigation error:', error);
            });
        },
        error: (error) => {
          console.error('❌ Login error:', error);
          this.loading = false;
          this.errorMessage = 'Login failed. Please try again.';
        },
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
