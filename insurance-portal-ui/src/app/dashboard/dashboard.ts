import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Added this
  imports: [CommonModule],
  template: `
    <div>
      <h2>Dashboard</h2>
      <p>Dashboard functionality will be implemented here.</p>
    </div>
  `,
})
export class Dashboard {
  // Dashboard logic
}
