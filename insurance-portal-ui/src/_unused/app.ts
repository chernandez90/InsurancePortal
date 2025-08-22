import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
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
})
export class App {
  title = 'insurance-portal-ui';
}
