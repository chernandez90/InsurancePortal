import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ClaimService, ClaimDto } from '../services/claim.service';

@Component({
  selector: 'app-claim-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h2>Submit New Claim</h2>

      <form [formGroup]="claimForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="policyNumber">Policy Number *</label>
          <input
            id="policyNumber"
            type="text"
            formControlName="policyNumber"
            class="form-control"
          />
          <div
            *ngIf="
              claimForm.get('policyNumber')?.invalid &&
              claimForm.get('policyNumber')?.touched
            "
            class="error"
          >
            Policy number is required (minimum 5 characters)
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <textarea
            id="description"
            formControlName="description"
            rows="4"
            class="form-control"
          >
          </textarea>
          <div
            *ngIf="
              claimForm.get('description')?.invalid &&
              claimForm.get('description')?.touched
            "
            class="error"
          >
            Description is required (minimum 10 characters)
          </div>
        </div>

        <div class="form-group">
          <label for="dateFiled">Date Filed *</label>
          <input
            id="dateFiled"
            type="date"
            formControlName="dateFiled"
            class="form-control"
          />
        </div>

        <div class="form-actions">
          <button
            type="submit"
            [disabled]="!claimForm.valid || submitting"
            class="submit-btn"
          >
            {{ submitting ? 'Submitting...' : 'Submit Claim' }}
          </button>
          <button type="button" (click)="goBack()" class="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .form-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .form-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
      }
      .form-control {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .error {
        color: #dc3545;
        font-size: 14px;
        margin-top: 5px;
      }
      .form-actions {
        display: flex;
        gap: 10px;
        margin-top: 30px;
      }
      .submit-btn,
      .cancel-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .submit-btn {
        background-color: #28a745;
        color: white;
      }
      .cancel-btn {
        background-color: #6c757d;
        color: white;
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class ClaimFormComponent {
  claimForm: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private claimService: ClaimService,
    private router: Router
  ) {
    this.claimForm = this.fb.group({
      policyNumber: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dateFiled: [new Date().toISOString().split('T')[0], Validators.required],
    });
  }

  onSubmit(): void {
    if (this.claimForm.valid) {
      this.submitting = true;
      const claimDto: ClaimDto = this.claimForm.value;

      this.claimService.submitClaim(claimDto).subscribe({
        next: (claim) => {
          console.log('Claim submitted successfully:', claim);
          this.router.navigate(['/claims']);
        },
        error: (error) => {
          console.error('Error submitting claim:', error);
          this.submitting = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/claims']);
  }
}
