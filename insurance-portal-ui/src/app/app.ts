import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true, // Added this
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <header>
        <h1>Insurance Portal</h1>
        <nav>
          <a routerLink="/claims">Claims</a>
          <a routerLink="/claim-form">Submit Claim</a>
        </nav>
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
      }
      header {
        background-color: #f8f9fa;
        padding: 20px;
        border-bottom: 1px solid #dee2e6;
      }
      nav {
        margin-top: 10px;
      }
      nav a {
        margin-right: 20px;
        text-decoration: none;
        color: #007bff;
        font-weight: 500;
      }
      nav a:hover {
        text-decoration: underline;
      }
      main {
        padding: 20px;
      }
    `,
  ],
})
export class App {
  title = 'insurance-portal-ui';
}
