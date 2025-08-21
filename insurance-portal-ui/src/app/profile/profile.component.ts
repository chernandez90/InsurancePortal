import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProfileService, ProfilePayload } from '../services/profile.service';
import { HeaderComponent } from '../shared/header.component';
import { SnackbarService } from '../shared/snackbar.service';
import { ProfileFormComponent } from './profile-form.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    ProfileFormComponent,
  ],
  template: `
    <div class="profile-page page-container">
      <div class="main-content profile-main">
        <h2>Your Profile</h2>

        <app-profile-form
          [initial]="loadedProfile"
          [disableEmail]="true"
          [loading]="loading"
          [error]="error"
          submitLabel="Save"
          (saved)="onSaveFromForm($event)"
          (cancel)="onCancel()"
        ></app-profile-form>
      </div>
    </div>
  `,
  styles: [
    `
      .page-container {
        min-height: 100vh;
        background-color: #f5f5f5;
        padding: 1rem;
      }

      .profile-main {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        max-width: 800px;
        margin: 0 auto;
      }
      .form-group {
        margin-bottom: 1rem;
      }
      input {
        width: 100%;
        padding: 0.5rem;
        box-sizing: border-box;
      }
      .actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }
      .error {
        color: #c82333;
        margin-top: 0.5rem;
      }
      .success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1rem;
      }
      button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
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

    this.profileService.getProfile(token).subscribe({
      next: (profile: ProfilePayload) => {
        // convert dob to yyyy-MM-dd for input value
        const p = { ...profile } as any;
        p.dob = this.toInputDate(profile.dob) || '';
        this.loadedProfile = p as ProfilePayload;
      },
      error: (err) => {
        this.error = 'Failed to load profile';
      },
    });
  }

  // convert server DOB (ISO or datetime) to yyyy-MM-dd for <input type="date">
  private toInputDate(d?: string | null): string {
    if (!d) return '';
    const s = String(d).trim();

    // already yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // ms epoch (all digits)
    if (/^\d+$/.test(s)) {
      const dt = new Date(Number(s));
      if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
      return '';
    }

    // Microsoft format: /Date(1596240000000)/
    const msMatch = /\/Date\((\d+)\)\//.exec(s);
    if (msMatch) {
      const dt = new Date(Number(msMatch[1]));
      if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
      return '';
    }

    // fallback: try Date parse for ISO or other formats
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) return dt.toISOString().split('T')[0];
    return '';
  }

  onSave(): void {
    // kept for compatibility; prefer onSaveFromForm
  }

  onSaveFromForm(payload: ProfilePayload): void {
    this.loading = true;
    this.error = '';

    const token = this.authService.getToken();
    // strip empty optional fields
    const p = { ...payload } as any;
    if (!p.dob) delete p.dob;
    if (!p.email) delete p.email;
    if (!p.address) delete p.address;

    this.profileService.updateProfile(p, token).subscribe({
      next: () => {
        this.loading = false;
        this.snack.show('Profile updated successfully.', { type: 'success' });
        const current = this.authService.getCurrentUserSnapshot() || {};
        const updated = {
          ...current,
          username: p.firstName || current.username,
        };
        this.authService.setCurrentUser(updated);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Failed to save profile';
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
