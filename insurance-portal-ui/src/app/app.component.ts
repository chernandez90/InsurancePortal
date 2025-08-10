import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  title = 'insurance-portal-ui';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Check if user is authenticated
    this.authService.currentUser$.subscribe((user) => {
      if (!user && this.router.url !== '/login') {
        this.router.navigate(['/login']);
      }
    });
  }
}
