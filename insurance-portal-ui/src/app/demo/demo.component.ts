import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="demo-page">
      <div class="demo-hero">
        <h1>Insurance Portal — Demo</h1>
        <p class="lead">
          Sample user: <strong>Alex Demo</strong> — preview policies, claims,
          and quick actions.
        </p>
      </div>

      <section class="demo-cards">
        <div class="card policy-card">
          <h3>Auto Policy <span class="badge">Active</span></h3>
          <p>Policy #: <strong>AUTO-2025-0001</strong></p>
          <p>Effective: 2025-06-01 — Expiry: 2026-06-01</p>
          <p>Coverage: Liability, Collision, Comprehensive</p>
          <div class="actions">
            <button class="btn">View Details</button>
            <button class="btn btn-outline">Download PDF</button>
          </div>
        </div>

        <div class="card claim-card">
          <h3>Recent Claim <span class="badge pending">In review</span></h3>
          <p>Claim #: <strong>CLM-1009</strong></p>
          <p>Loss date: 2025-07-15 — Submitted: 2025-07-16</p>
          <p>Amount: $2,400 (estimated)</p>
          <div class="timeline">
            <div class="step done">Submitted</div>
            <div class="step done">Assigned</div>
            <div class="step current">In review</div>
            <div class="step">Settled</div>
          </div>
          <div class="actions">
            <button class="btn">View Claim</button>
            <button class="btn btn-outline">Download Report</button>
          </div>
        </div>
      </section>

      <section class="demo-cta">
        <p>
          This is a demo page with mock data. Use the header links to explore
          other pages or click the buttons to view static details.
        </p>
      </section>
    </div>
  `,
  styles: [
    `
      .demo-page {
        max-width: 960px;
        margin: 0 auto;
        padding: 2rem;
      }
      .demo-hero {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .lead {
        color: #555;
      }
      .demo-cards {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .card {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      }
      .badge {
        background: #28a745;
        color: #fff;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.8rem;
        margin-left: 0.5rem;
      }
      .badge.pending {
        background: #ffc107;
        color: #222;
      }
      .actions {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
      }
      .btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        cursor: pointer;
      }
      .btn-outline {
        background: transparent;
        border: 1px solid #ddd;
        color: #333;
      }
      .timeline {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
      .step {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        background: #f0f0f0;
      }
      .step.done {
        background: #e6f9ec;
        color: #027a3b;
      }
      .step.current {
        background: #fff3cd;
        color: #856404;
      }
      .demo-cta {
        margin-top: 1.5rem;
        text-align: center;
        color: #666;
      }
      @media (max-width: 720px) {
        .demo-cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DemoComponent {}
