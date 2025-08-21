import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  AuthService,
  RegisterDto,
  AuthResponse,
} from '../services/auth.service'; // Add AuthResponse to imports
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2 *ngIf="step === 'register'">Register for Insurance Portal</h2>
        <h2 *ngIf="step === 'profile'">Create Your Profile</h2>
        <h2 *ngIf="step === 'done'">Welcome!</h2>

        <!-- Step 1: Account registration -->
        <form
          *ngIf="step === 'register'"
          [formGroup]="registerForm"
          (ngSubmit)="onSubmit()"
        >
          <div class="form-group">
            <label for="username">Username *</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="form-control"
              placeholder="Choose a username"
            />
            <div *ngIf="registerForm.get('username')?.touched">
              <div
                *ngIf="registerForm.get('username')?.hasError('required')"
                class="error-message"
              >
                Username is required
              </div>
              <div
                *ngIf="registerForm.get('username')?.hasError('minlength')"
                class="error-message"
              >
                Username must be at least 3 characters
              </div>
              <div
                *ngIf="registerForm.get('username')?.hasError('pattern')"
                class="error-message"
              >
                Username cannot contain spaces
              </div>
              <div
                *ngIf="registerForm.get('username')?.hasError('taken')"
                class="error-message"
              >
                Username already exists.
              </div>
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
            <div *ngIf="registerForm.get('email')?.touched">
              <div
                *ngIf="registerForm.get('email')?.hasError('required')"
                class="error-message"
              >
                Email is required
              </div>
              <div
                *ngIf="registerForm.get('email')?.hasError('email')"
                class="error-message"
              >
                Enter a valid email
              </div>
              <div
                *ngIf="registerForm.get('email')?.hasError('taken')"
                class="error-message"
              >
                Email already exists.
              </div>
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

          <div *ngIf="errorMessage" class="alert error">{{ errorMessage }}</div>

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

        <!-- Step 2: Profile creation -->
        <form
          *ngIf="step === 'profile'"
          [formGroup]="profileForm"
          (ngSubmit)="onProfileSubmit(profileForm)"
        >
          <div class="form-group">
            <label for="firstName">First name *</label>
            <input
              id="firstName"
              type="text"
              formControlName="firstName"
              class="form-control"
            />
            <div
              *ngIf="
                profileForm.get('firstName')?.invalid &&
                profileForm.get('firstName')?.touched
              "
              class="error-message"
            >
              First name is required
            </div>
          </div>

          <div class="form-group">
            <label for="lastName">Last name *</label>
            <input
              id="lastName"
              type="text"
              formControlName="lastName"
              class="form-control"
            />
            <div
              *ngIf="
                profileForm.get('lastName')?.invalid &&
                profileForm.get('lastName')?.touched
              "
              class="error-message"
            >
              Last name is required
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              formControlName="phone"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="dob">Date of birth</label>
            <input
              id="dob"
              type="date"
              formControlName="dob"
              class="form-control"
            />
          </div>

          <div *ngIf="errorMessage" class="alert error">{{ errorMessage }}</div>

          <div class="form-actions">
            <button
              type="submit"
              [disabled]="profileForm.invalid || loading"
              class="btn-primary"
            >
              {{ loading ? 'Saving...' : 'Save Profile' }}
            </button>
          </div>
        </form>

        <!-- Done -->
        <div *ngIf="step === 'done'" class="done">
          <p>
            Your account and profile have been created. Redirecting to
            dashboard...
          </p>
        </div>
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
  // two-step: 'register' | 'profile' | 'done'
  step: 'register' | 'profile' | 'done' = 'register';

  // store minimal info from register response
  private registeredUsername: string | null = null;
  private registeredEmail: string | null = null;
  profileForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.fb.group({
      // username: required, min length 3, no whitespace allowed
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^\S+$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // clear server-side 'taken' error when user edits username
    const usernameCtrl = this.registerForm.get('username');
    if (usernameCtrl) {
      usernameCtrl.valueChanges.subscribe(() => {
        const ctrl = this.registerForm.get('username');
        if (!ctrl) return;
        const errors = ctrl.errors;
        if (errors && errors['taken']) {
          const { taken, ...rest } = errors as any;
          ctrl.setErrors(Object.keys(rest).length ? rest : null);
        }
      });
    }

    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phone: [''],
      dob: [''],
    });

    // If the route includes ?step=profile (e.g. user logged in but profile incomplete),
    // switch to profile step and prefill available user info from AuthService.
    this.route.queryParams.subscribe((q) => {
      if (q['step'] === 'profile') {
        // If we have an authenticated user, prefill email/username
        const current = this.authService.getCurrentUserSnapshot() || {};
        this.registeredUsername = current.username || null;
        this.registeredEmail = current.email || null;
        this.step = 'profile';
        setTimeout(() => {
          if (this.registeredEmail) {
            this.profileForm.patchValue({ email: this.registeredEmail });
            const emailCtrl = this.profileForm.get('email');
            if (emailCtrl) emailCtrl.disable();
          }
        }, 0);
      }
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
          // Save username and advance to profile step
          this.registeredUsername =
            response.username || this.registerForm.value.username;
          this.registeredEmail =
            response.email || this.registerForm.value.email;
          // prefill email into profile step and disable editing
          this.step = 'profile';
          // patch and disable the email control so user cannot change it
          setTimeout(() => {
            this.profileForm.patchValue({ email: this.registeredEmail || '' });
            const emailCtrl = this.profileForm.get('email');
            if (emailCtrl) {
              emailCtrl.disable();
            }
          }, 0);
        },
        error: (error: any) => {
          this.loading = false;

          const resp = error?.error;
          let serverMsg = '';

          // Various backend shapes: plain string, { message }, { detail }, RFC7807, { errors: { field: [msgs] } }, ModelState
          if (typeof resp === 'string') {
            serverMsg = resp;
          } else if (resp) {
            serverMsg = resp.message || resp.detail || resp.title || '';

            if (!serverMsg && Array.isArray(resp)) {
              serverMsg = resp.join(' ');
            }

            if (!serverMsg && resp.errors) {
              if (Array.isArray(resp.errors)) {
                serverMsg = resp.errors.join(' ');
              } else if (typeof resp.errors === 'object') {
                // prefer username-specific error if present
                if (resp.errors.username) {
                  serverMsg = Array.isArray(resp.errors.username)
                    ? resp.errors.username.join(' ')
                    : String(resp.errors.username);
                } else {
                  serverMsg = Object.values(resp.errors)
                    .flat()
                    .map((v: any) => String(v))
                    .join(' ');
                }
              }
            }

            if (!serverMsg && resp.ModelState) {
              serverMsg = Object.values(resp.ModelState)
                .flat()
                .map((v: any) => String(v))
                .join(' ');
            }
          }

          const fallback = error?.message || 'Registration failed';

          // Prefer exact backend messages when present
          const normalized = (serverMsg || '').toString().trim();
          const usernameExact = /username already exists\.?/i.test(normalized);
          const emailExact = /email already exists\.?/i.test(normalized);

          // Also check structured errors for exact messages
          let foundUsername = usernameExact;
          let foundEmail = emailExact;
          if (resp && resp.errors && typeof resp.errors === 'object') {
            const e = resp.errors;
            if (e.username) {
              const txt = Array.isArray(e.username)
                ? e.username.join(' ')
                : String(e.username);
              if (/username already exists\.?/i.test(txt)) foundUsername = true;
            }
            if (e.email) {
              const txt = Array.isArray(e.email)
                ? e.email.join(' ')
                : String(e.email);
              if (/email already exists\.?/i.test(txt)) foundEmail = true;
            }
          }

          // Fallback heuristics (keep previous behavior) if no exact match
          if (!foundUsername && !foundEmail) {
            foundUsername =
              error?.status === 409 ||
              /username.*exist/i.test(serverMsg) ||
              /duplicateusername/i.test(serverMsg) ||
              (/user.*exists/i.test(serverMsg) && /username/i.test(serverMsg));
            foundEmail =
              error?.status === 409 ||
              /email.*exist/i.test(serverMsg) ||
              /duplicateemail/i.test(serverMsg) ||
              (/user.*exists/i.test(serverMsg) && /email/i.test(serverMsg)) ||
              /already.*exist.*email/i.test(serverMsg);
          }

          if (foundUsername) {
            this.errorMessage = 'Username already exists.';
            const ctrl = this.registerForm.get('username');
            if (ctrl) {
              const existing = ctrl.errors || {};
              ctrl.setErrors({ ...existing, taken: true });
            }
          }

          if (foundEmail) {
            // If both found, concatenate messages
            this.errorMessage = this.errorMessage
              ? this.errorMessage + ' Email already exists.'
              : 'Email already exists.';
            const ctrl = this.registerForm.get('email');
            if (ctrl) {
              const existing = ctrl.errors || {};
              ctrl.setErrors({ ...existing, taken: true });
            }
          }

          if (!foundUsername && !foundEmail) {
            this.errorMessage = serverMsg || fallback;
          }
        },
      });
    }
  }

  onProfileSubmit(profileForm: FormGroup): void {
    if (profileForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const payload: any = {
      firstName: profileForm.value.firstName,
      lastName: profileForm.value.lastName,
      phone: profileForm.value.phone,
      dob: profileForm.value.dob,
      email: this.registeredEmail || profileForm.get('email')?.value,
    };

    if (this.registeredUsername) {
      payload.username = this.registeredUsername;
    }

    const token = this.authService.getToken();

    this.profileService.createProfile(payload, token).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'done';
        // update current user so header shows first name immediately
        try {
          const current = this.authService.getCurrentUserSnapshot() || {};
          const updated = {
            ...current,
            // set username field to firstName so header (which prefers username) shows first name
            username: payload.firstName || current.username,
            email: payload.email || current.email,
          };
          this.authService.setCurrentUser(updated);
        } catch (e) {
          // noop
        }

        // navigate to dashboard after a short delay so user sees success
        setTimeout(() => this.router.navigate(['/dashboard']), 900);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to create profile';
      },
    });
  }

  backToRegister(): void {
    this.step = 'register';
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
