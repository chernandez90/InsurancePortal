import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/header.component';
import { SnackbarComponent } from './shared/snackbar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SnackbarComponent],
  template: `
    <div class="app-root">
      <app-header [hideNav]="hideNav"></app-header>
      <router-outlet></router-outlet>
      <app-snackbar></app-snackbar>
    </div>
  `,
  styles: [
    `
      .app-root {
        background-color: #f5f5f5;
        min-height: 100vh;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  title = 'insurance-portal-ui';
  showHeader = true;
  hideNav = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Avoid redirecting to login prematurely: check token presence first
    const token = this.authService.getToken();
    if (!token && this.router.url !== '/login') {
      this.router.navigate(['/login']);
      return;
    }

    // Also keep watching user changes for logout/expiry
    this.authService.currentUser$.subscribe((user) => {
      if (
        !user &&
        !this.authService.isAuthenticated &&
        this.router.url !== '/login'
      ) {
        this.router.navigate(['/login']);
      }
    });

    // determine when to hide nav actions (keep brand visible)
    this.updateHeaderVisibility(this.router.url);
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.updateHeaderVisibility(e.urlAfterRedirects || e.url);
      });
  }

  private updateHeaderVisibility(url: string): void {
    const path = url.split('?')[0];
    // keep the header rendered (brand visible) but hide nav/actions on auth screens
    this.hideNav =
      path === '/login' || path === '/register' || path === '/profile-setup';
  }
}
