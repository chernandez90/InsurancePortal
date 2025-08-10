import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthService,
  RegisterDto,
  AuthResponse,
} from '../services/auth.service'; // Add AuthResponse to imports

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Register for Insurance Portal</h2>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username *</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="form-control"
              placeholder="Choose a username"
            />
            <div
              *ngIf="
                registerForm.get('username')?.invalid &&
                registerForm.get('username')?.touched
              "
              class="error-message"
            >
              Username is required (minimum 3 characters)
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-control"
              placeholder="Enter your email"
            />
            <div
              *ngIf="
                registerForm.get('email')?.invalid &&
                registerForm.get('email')?.touched
              "
              class="error-message"
            >
              Valid email is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password *</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-control"
              placeholder="Choose a password"
            />
            <div
              *ngIf="
                registerForm.get('password')?.invalid &&
                registerForm.get('password')?.touched
              "
              class="error-message"
            >
              Password is required (minimum 6 characters)
            </div>
          </div>

          <div *ngIf="errorMessage" class="alert error">
            {{ errorMessage }}
          </div>

          <div class="form-actions">
            <button
              type="submit"
              [disabled]="!registerForm.valid || loading"
              class="btn-primary"
            >
              {{ loading ? 'Creating Account...' : 'Register' }}
            </button>
          </div>

          <div class="login-link">
            Already have an account?
            <button type="button" (click)="goToLogin()" class="link-button">
              Login here
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
        background-color: #f5f5f5;
      }
      .register-card {
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
        background-color: #28a745;
        color: white;
      }
      .btn-primary:hover:not(:disabled) {
        background-color: #218838;
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .login-link {
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const userData: RegisterDto = this.registerForm.value;

      this.authService.register(userData).subscribe({
        next: (response: AuthResponse) => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Registration failed';
        },
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
