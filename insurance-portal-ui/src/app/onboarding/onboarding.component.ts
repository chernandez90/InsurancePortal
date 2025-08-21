import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProfileService, ProfilePayload } from '../services/profile.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../shared/snackbar.service';
import { ProfileFormComponent } from '../profile/profile-form.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfileFormComponent],
  template: `
    <div class="page-container">
      <div class="register-container">
        <div class="register-card">
          <h2>Create Your Profile</h2>

          <app-profile-form
            [initial]="loadedProfile"
            [disableEmail]="true"
            [loading]="loading"
            [error]="error"
            [showCancel]="false"
            submitLabel="Save Profile"
            (saved)="onSavedFromForm($event)"
          ></app-profile-form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        min-height: 100vh;
        background: #f5f5f5;
        padding: 1rem;
      }
      .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
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
      .error {
        color: #dc3545;
        font-size: 14px;
        margin-top: 5px;
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
    `,
  ],
})
export class OnboardingComponent implements OnInit {
  loadedProfile: ProfilePayload | null = null;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private snack: SnackbarService
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // load profile if present; if it already has a name, go to dashboard
    this.profileService.getProfile(token).subscribe({
      next: (profile: ProfilePayload) => {
        if (profile && (profile.firstName || profile.lastName)) {
          this.router.navigate(['/dashboard']);
          return;
        }
        // prefill loadedProfile and let the child form patch itself
        const p: any = { ...profile };
        p.dob = profile?.dob || '';
        this.loadedProfile = p as ProfilePayload;
      },
      error: () => {
        // treat as no profile — prefill from auth snapshot
        const current = this.authService.getCurrentUserSnapshot() || {};
        this.loadedProfile = { email: current.email || '' } as ProfilePayload;
      },
    });
  }

  onSave(): void {
    // kept for compatibility
  }

  onSavedFromForm(payload: ProfilePayload): void {
    this.loading = true;
    this.error = '';
    const token = this.authService.getToken();
    const p: any = { ...payload };
    this.profileService.createProfile(p, token).subscribe({
      next: () => {
        this.loading = false;
        this.snack.show('Profile created. Redirecting...', { type: 'success' });
        const current = this.authService.getCurrentUserSnapshot() || {};
        this.authService.setCurrentUser({
          ...current,
          username: p.firstName || current.username,
          email: p.email || current.email,
        });
        setTimeout(() => this.router.navigate(['/dashboard']), 700);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to create profile';
      },
    });
  }
}
