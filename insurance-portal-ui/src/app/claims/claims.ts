import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-claims',
  standalone: true, // Added this
  imports: [CommonModule],
  template: `
    <div>
      <h2>Claims</h2>
      <p>Claims functionality will be implemented here.</p>
    </div>
  `,
})
export class Claims implements OnInit {
  ngOnInit() {
    // Component initialization logic
  }
}
