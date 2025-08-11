import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h2>🏢 Insurance Portal Dashboard</h2>
        <div class="user-info">
          <span>Welcome back!</span>
          <button (click)="logout()" class="btn btn-logout">Logout</button>
        </div>
      </header>

      <main class="dashboard-content">
        <p>Dashboard functionality will be implemented here.</p>
        <div class="test-info">
          <h3>✅ Login Successful!</h3>
          <p>You have successfully logged into the Insurance Portal.</p>
        </div>

        <!-- Updated navigation section -->
        <div class="navigation-section">
          <h3>Quick Actions</h3>
          <div class="action-buttons">
            <button (click)="goToClaimsList()" class="btn btn-primary">
              📋 View All Claims
            </button>
            <button (click)="goToDocuments()" class="btn btn-primary">
              📄 Documents
            </button>
            <button (click)="goToProfile()" class="btn btn-primary">
              👤 Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        min-height: 100vh;
        background-color: #f5f5f5;
        padding: 1rem;
      }

      .dashboard-header {
        background: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .dashboard-header h2 {
        margin: 0;
        color: #333;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .dashboard-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .test-info {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
        padding: 1rem;
        margin-top: 1rem;
      }

      .test-info h3 {
        color: #155724;
        margin: 0 0 0.5rem 0;
      }

      .test-info p {
        color: #155724;
        margin: 0;
      }

      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }

      .btn-logout {
        background: #dc3545;
        color: white;
      }

      .btn-logout:hover {
        background: #c82333;
      }

      .navigation-section {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #e9ecef;
      }

      .navigation-section h3 {
        color: #333;
        margin-bottom: 1rem;
      }

      .action-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        max-width: 800px;
      }

      .btn-primary {
        background: #007bff;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }

      .btn-primary:hover {
        background: #0056b3;
      }

      .btn-secondary {
        background: #28a745;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }

      .btn-secondary:hover {
        background: #218838;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('Dashboard component loaded successfully!');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToClaimsList(): void {
    this.router.navigate(['/claims-list']);
  }

  goToClaims(): void {
    this.router.navigate(['/claims']); // This goes to submit new claim
  }

  goToDocuments(): void {
    // Placeholder for future implementation
    alert('Documents section coming soon!');
  }

  goToProfile(): void {
    // Placeholder for future implementation
    alert('Profile section coming soon!');
  }
}
