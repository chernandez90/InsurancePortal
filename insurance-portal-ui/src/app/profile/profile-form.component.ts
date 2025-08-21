import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProfilePayload } from '../services/profile.service';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="profileForm" (ngSubmit)="submit()">
      <div class="form-group">
        <label>First name *</label>
        <input class="form-control" formControlName="firstName" />
        <div
          *ngIf="
            profileForm.get('firstName')?.invalid &&
            profileForm.get('firstName')?.touched
          "
          class="error"
        >
          First name is required
        </div>
      </div>

      <div class="form-group">
        <label>Last name *</label>
        <input class="form-control" formControlName="lastName" />
        <div
          *ngIf="
            profileForm.get('lastName')?.invalid &&
            profileForm.get('lastName')?.touched
          "
          class="error"
        >
          Last name is required
        </div>
      </div>

      <div class="form-group">
        <label>Email</label>
        <input class="form-control" formControlName="email" />
      </div>

      <div class="form-group">
        <label>Phone</label>
        <input class="form-control" formControlName="phone" />
      </div>

      <div class="form-group">
        <label>Date of birth</label>
        <input class="form-control" type="date" formControlName="dob" />
      </div>

      <div class="actions" [class.no-cancel]="!showCancel">
        <button *ngIf="showCancel" type="button" (click)="cancel.emit()">
          Cancel
        </button>
        <button
          type="submit"
          class="btn-primary"
          [disabled]="profileForm.invalid || profileForm.pristine || loading"
        >
          {{ loading ? loadingLabel || 'Saving...' : submitLabel || 'Save' }}
        </button>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>
    </form>
  `,
  styles: [
    `
      .form-group {
        margin-bottom: 1rem;
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
      .actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }
      .actions.no-cancel .btn-primary {
        width: 100%;
      }
      .error {
        color: #c82333;
        margin-top: 0.5rem;
      }
      button {
        padding: 0.5rem 1rem;
        border-radius: 4px;
      }
      .btn-primary {
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
    `,
  ],
})
export class ProfileFormComponent implements OnChanges {
  @Input() initial?: ProfilePayload | null;
  @Input() disableEmail = false;
  @Input() loading = false;
  @Input() error = '';
  @Input() showCancel = true;
  @Input() submitLabel?: string;
  @Input() loadingLabel?: string;

  @Output() saved = new EventEmitter<ProfilePayload>();
  @Output() cancel = new EventEmitter<void>();

  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phone: [''],
      dob: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initial'] && this.initial) {
      // patch but preserve disabled state handling afterwards
      this.profileForm.patchValue({
        firstName: this.initial.firstName || '',
        lastName: this.initial.lastName || '',
        email: this.initial.email || '',
        phone: this.initial.phone || '',
        dob: this.initial.dob || '',
      });
    }

    if (changes['disableEmail']) {
      const ctrl = this.profileForm.get('email');
      if (this.disableEmail) ctrl?.disable();
      else ctrl?.enable();
    }
  }

  submit(): void {
    if (this.profileForm.invalid) return;
    const payload = this.profileForm.getRawValue() as ProfilePayload;
    this.saved.emit(payload);
  }
}
