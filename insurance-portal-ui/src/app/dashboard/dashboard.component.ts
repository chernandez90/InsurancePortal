import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../shared/header.component';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <div class="dashboard-container">
      <main class="dashboard-content">
        <div class="welcome-banner">
          <h1>Welcome back, {{ firstNameOnly }}!</h1>
        </div>
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

      /* header styles moved to shared/header.component.ts */

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
  displayName: string | null = null;
  get firstNameOnly(): string {
    if (!this.displayName) return '';
    // if email, show the part before @; otherwise show first word
    if (this.displayName.includes('@')) return this.displayName.split('@')[0];
    return this.displayName.split(' ')[0];
  }
  get initials(): string {
    if (!this.displayName) return '';
    return this.displayName.charAt(0).toUpperCase();
  }
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user and display their name or email when available
    this.authService.currentUser$.subscribe((user) => {
      this.displayName = user?.username || user?.email || null;

      // attempt to fetch fuller profile (first/last name) if token is available
      const token = this.authService.getToken();
      if (token) {
        this.profileService.getProfile(token).subscribe({
          next: (profile) => {
            if (profile?.firstName) {
              this.displayName = profile.firstName;
            }
          },
          error: () => {
            // ignore - keep username/email if profile not available
          },
        });
      }
    });
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
    this.router.navigate(['/profile']);
  }
}
