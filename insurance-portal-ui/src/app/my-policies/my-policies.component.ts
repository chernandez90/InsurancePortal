import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { PolicyService, UserPolicy } from '../services/policy.service';
import { AssetService, Asset } from '../services/asset.service';
import { SnackbarService } from '../shared/snackbar.service';
import { ConfirmDialogService } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-my-policies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>My Policies</h2>
      <p>View and manage your active policies.</p>

      <div *ngIf="policies.length === 0">No policies found.</div>

      <div class="list">
        <div class="item" *ngFor="let p of policies">
          <h3>
            {{ p.policy.name }} <small class="code">{{ p.policy.code }}</small>
          </h3>
          <div>Effective: {{ p.effectiveDate | date }}</div>
          <div *ngIf="p.assetId">
            Attached asset:
            <strong>{{ assetsById[p.assetId]?.name || 'Unknown' }}</strong>
          </div>
          <div *ngIf="!p.isActive">
            Terminated: {{ p.terminatedDate | date }}
          </div>
          <div *ngIf="p.isActive">
            <button (click)="terminate(p)" class="terminate">Terminate</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        padding: 1rem;
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .item {
        background: #fff;
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
      }
      .code {
        color: #666;
        font-size: 12px;
      }
      .terminate {
        background: #dc3545;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
      }
    `,
  ],
})
export class MyPoliciesComponent {
  policies: UserPolicy[] = [];
  assets: Asset[] = [];
  assetsById: Record<string, Asset> = {};

  constructor(
    private svc: PolicyService,
    private assetSvc: AssetService,
    private snack: SnackbarService,
    private confirm: ConfirmDialogService
  ) {
    this.load();
  }

  load() {
    // load assets and policies in parallel and build an asset lookup map
    forkJoin({
      assets: this.assetSvc.mine(),
      policies: this.svc.mine(),
    }).subscribe({
      next: ({ assets, policies }) => {
        this.assets = assets || [];
        this.assetsById = {};
        this.assets.forEach((a) => (this.assetsById[a.id] = a));
        this.policies = policies || [];
      },
      error: (err) => {
        console.error('Failed to load policies or assets', err);
        this.snack.show('Failed to load policies', { type: 'error' });
        this.policies = [];
      },
    });
  }

  terminate(p: UserPolicy) {
    this.confirm.confirm('Terminate coverage for this policy?').then((ok) => {
      if (!ok) return;
      this.svc.terminate(p.id).subscribe({
        next: () => this.load(),
        error: (err) => {
          console.error(err);
          this.snack.show('Failed to terminate policy', { type: 'error' });
        },
      });
    });
  }
}
