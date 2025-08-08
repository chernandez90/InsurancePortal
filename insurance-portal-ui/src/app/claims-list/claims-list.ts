import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClaimService, InsuranceClaim } from '../services/claim.service';

@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="claims-container">
      <h2>Insurance Claims</h2>

      <div *ngIf="loading" class="loading">Loading claims...</div>

      <div *ngIf="!loading && claims.length === 0" class="no-claims">
        No claims found. <a routerLink="/claim-form">Submit your first claim</a>
      </div>

      <div *ngIf="!loading && claims.length > 0" class="claims-list">
        <div *ngFor="let claim of claims" class="claim-item">
          <div class="claim-header">
            <h3>Claim #{{ claim.id }}</h3>
            <span class="policy-number">Policy: {{ claim.policyNumber }}</span>
          </div>
          <p class="description">{{ claim.description }}</p>
          <span class="date-filed">Filed: {{ claim.dateFiled | date }}</span>
        </div>
      </div>

      <button class="add-claim-btn" routerLink="/claim-form">
        + Submit New Claim
      </button>
    </div>
  `,
  styles: [
    `
      .claims-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      .claim-item {
        border: 1px solid #ddd;
        margin: 15px 0;
        padding: 20px;
        border-radius: 8px;
        background: #f9f9f9;
      }
      .claim-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .claim-header h3 {
        margin: 0;
        color: #333;
      }
      .policy-number {
        font-weight: bold;
        color: #007bff;
      }
      .description {
        margin: 10px 0;
        color: #666;
      }
      .date-filed {
        font-size: 14px;
        color: #999;
      }
      .add-claim-btn {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 20px;
        font-size: 16px;
      }
      .add-claim-btn:hover {
        background-color: #0056b3;
      }
      .loading,
      .no-claims {
        text-align: center;
        padding: 40px;
        color: #666;
      }
      .no-claims a {
        color: #007bff;
        text-decoration: none;
      }
    `,
  ],
})
export class ClaimsListComponent implements OnInit {
  claims: InsuranceClaim[] = [];
  loading = false;

  constructor(private claimService: ClaimService) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading = true;
    this.claimService.getAllClaims().subscribe({
      next: (claims) => {
        this.claims = claims;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading claims:', error);
        this.loading = false;
      },
    });
  }
}
