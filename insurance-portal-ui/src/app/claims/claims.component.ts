import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="claims-container">
      <header class="claims-header">
        <h2>📋 Insurance Claims</h2>
        <div class="header-actions">
          <button (click)="goToDashboard()" class="btn btn-secondary">
            ← Back to Dashboard
          </button>
          <button (click)="logout()" class="btn btn-logout">Logout</button>
        </div>
      </header>

      <main class="claims-content">
        <div class="claims-section">
          <h3>Your Claims</h3>
          <p>Claims management functionality will be implemented here.</p>

          <div class="placeholder-content">
            <div class="claim-card">
              <h4>Sample Claim #12345</h4>
              <p><strong>Status:</strong> Under Review</p>
              <p><strong>Type:</strong> Auto Insurance</p>
              <p><strong>Date:</strong> Today</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .claims-container {
        min-height: 100vh;
        background-color: #f5f5f5;
        padding: 1rem;
      }

      .claims-header {
        background: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .claims-header h2 {
        margin: 0;
        color: #333;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }

      .claims-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .claims-section h3 {
        color: #333;
        margin-bottom: 1rem;
      }

      .placeholder-content {
        margin-top: 2rem;
      }

      .claim-card {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
      }

      .claim-card h4 {
        color: #007bff;
        margin: 0 0 1rem 0;
      }

      .claim-card p {
        margin: 0.5rem 0;
        color: #666;
      }

      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #545b62;
      }

      .btn-logout {
        background: #dc3545;
        color: white;
      }

      .btn-logout:hover {
        background: #c82333;
      }
    `,
  ],
})
export class ClaimsComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('Claims component loaded successfully!');
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
