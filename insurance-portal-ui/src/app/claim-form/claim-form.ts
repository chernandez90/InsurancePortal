import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClaimService, ClaimDto } from '../services/claim.service';

@Component({
  selector: 'app-claim-form',
  templateUrl: './claim-form.html',
  styleUrls: ['./claim-form.scss'],
})
export class ClaimForm {
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
}
