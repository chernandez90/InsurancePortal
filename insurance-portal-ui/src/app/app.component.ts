import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterModule,
  Router,
  NavigationEnd,
} from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="app-container">
      <header>
        <h1>Insurance Portal</h1>
        <nav *ngIf="authService.isAuthenticated(); else guestNav">
          <a routerLink="/claims" routerLinkActive="active">Claims</a>
          <a routerLink="/claim-form" routerLinkActive="active">Submit Claim</a>
          <span class="user-info" *ngIf="currentUser">
            Welcome, {{ currentUser.username }}
          </span>
          <button (click)="logout()" class="logout-btn">Logout</button>
        </nav>
        <ng-template #guestNav>
          <nav *ngIf="!isOnAuthPage">
            <a routerLink="/login" routerLinkActive="active">Login</a>
            <a routerLink="/register" routerLinkActive="active">Register</a>
          </nav>
        </ng-template>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        font-family: Arial, sans-serif;
      }
      header {
        background-color: #f8f9fa;
        padding: 20px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      h1 {
        margin: 0;
        color: #333;
      }
      nav {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      nav a {
        text-decoration: none;
        color: #007bff;
        font-weight: 500;
        padding: 8px 16px;
        border-radius: 4px;
        transition: all 0.2s;
      }
      nav a:hover,
      nav a.active {
        background-color: #007bff;
        color: white;
      }
      .user-info {
        color: #666;
        font-style: italic;
      }
      .logout-btn {
        background-color: #dc3545;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .logout-btn:hover {
        background-color: #c82333;
      }
      main {
        padding: 20px;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  currentUser: any = null;
  currentUser$;
  isOnAuthPage = false;

  constructor(public authService: AuthService, private router: Router) {
    // Initialize currentUser$ in constructor after authService is available
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser$.subscribe((user) => (this.currentUser = user));
  }

  ngOnInit(): void {
    // Listen to route changes to determine if we're on auth pages
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isOnAuthPage = event.url === '/login' || event.url === '/register';
      });

    // Check initial route
    this.isOnAuthPage =
      this.router.url === '/login' || this.router.url === '/register';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
