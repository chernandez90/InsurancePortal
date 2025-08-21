import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="claims-header global-header">
      <div class="header-left">
        <h2><span class="brand-icon">🏢</span>Insurance Portal</h2>
        <button
          class="menu-toggle"
          (click)="menuOpen = !menuOpen"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <nav *ngIf="!hideNav" class="nav-links" [class.open]="menuOpen">
          <a routerLink="/demo" (click)="menuOpen = false">Demo</a>
          <a
            *ngIf="isAuthenticated"
            routerLink="/dashboard"
            (click)="menuOpen = false"
            >Dashboard</a
          >
          <a
            *ngIf="isAuthenticated"
            routerLink="/claims-list"
            (click)="menuOpen = false"
            >Claims</a
          >
          <a
            *ngIf="isAuthenticated"
            routerLink="/claim-form"
            (click)="menuOpen = false"
            >Submit Claim</a
          >
        </nav>
      </div>

      <div
        *ngIf="isAuthenticated && !hideNav && showActions"
        class="header-actions"
      >
        <div class="user-badge" *ngIf="displayName">
          <span class="avatar">{{ initials }}</span>
          <span class="greeting">Welcome back, {{ firstNameOnly }}!</span>
        </div>
        <button (click)="logout()" class="btn btn-logout">Logout</button>
      </div>
    </header>
  `,
  styles: [
    `
      .global-header {
        background: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }
      .global-header h2 {
        margin: 0;
        color: #333;
        font-size: 1.25rem;
      }
      .brand-icon {
        margin-right: 0.5rem;
        font-size: 1.25rem;
        display: inline-block;
      }
      .menu-toggle {
        display: none;
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
      }
      .nav-links a {
        margin-right: 1rem;
        text-decoration: none;
        color: #007bff;
        font-weight: 500;
      }
      .nav-links a:hover {
        text-decoration: underline;
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .btn-logout {
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-logout:hover {
        background: #c82333;
      }
      .user-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #007bff;
        color: white;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
      }
      .greeting {
        font-weight: 500;
        color: #333;
      }
      /* Responsive: show toggle and collapse nav on small screens */
      @media (max-width: 720px) {
        .menu-toggle {
          display: inline-block;
        }
        .nav-links {
          display: none;
          position: absolute;
          top: 64px;
          left: 0;
          right: 0;
          background: white;
          padding: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          z-index: 40;
        }
        .nav-links.open {
          display: block;
        }
        .nav-links a {
          display: block;
          margin: 0.5rem 0;
        }
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  @Input() hideNav = false;
  displayName: string | null = null;
  menuOpen = false;
  isAuthenticated = false;
  showActions = false;
  get firstNameOnly(): string {
    if (!this.displayName) return '';
    if (this.displayName.includes('@')) return this.displayName.split('@')[0];
    return this.displayName.split(' ')[0];
  }
  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.token$.subscribe((t) => {
      this.isAuthenticated = !!t;
      // only attempt to read profile when authenticated
      if (t) {
        this.authService.currentUser$.subscribe((user) => {
          this.displayName = user?.username || user?.email || null;
          this.profileService.getProfile(t).subscribe({
            next: (profile) => {
              if (profile) {
                if (profile.firstName) this.displayName = profile.firstName;
                this.showActions = !!(profile.firstName || profile.lastName);
              } else {
                this.showActions = false;
              }
            },
            error: () => {
              this.showActions = false;
            },
          });
        });
      } else {
        this.displayName = null;
        this.showActions = false;
      }
    });
  }

  get initials(): string {
    if (!this.displayName) return '';
    return this.displayName.charAt(0).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
