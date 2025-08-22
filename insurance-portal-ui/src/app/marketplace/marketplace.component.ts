import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyService, Policy } from '../services/policy.service';
import { AssetService, Asset } from '../services/asset.service';
import { SnackbarService } from '../shared/snackbar.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>Marketplace</h2>
      <p>Shop available insurance products and add them to your account.</p>

      <div *ngIf="loading" class="loading">Loading marketplace...</div>

      <div *ngIf="!loading && loadError" class="empty">
        <p>Unable to load marketplace. Try again later.</p>
      </div>

      <div
        *ngIf="!loading && !loadError && policies.length === 0"
        class="empty"
      >
        <p>No policies available right now.</p>
      </div>

      <div class="grid" *ngIf="!loading && !loadError && policies.length > 0">
        <div class="card" *ngFor="let p of policies">
          <h3>
            {{ p.name }} <small class="code">{{ p.code }}</small>
          </h3>
          <p>{{ p.description }}</p>
          <div class="meta">Monthly: &#36;{{ p.monthlyPremium }}</div>
          <div style="margin-top:8px">
            <label for="asset-{{ p.id }}"
              >{{
                allowedType(p) === 'Life'
                  ? 'Beneficiaries'
                  : 'Associate with asset'
              }}:</label
            >
            <select [attr.data-policy]="p.id" id="asset-{{ p.id }}">
              <option value="">(None)</option>
              <ng-container *ngIf="allowedType(p) === 'Life'">
                <option
                  *ngFor="let b of beneficiariesForPolicy(p)"
                  [value]="b.id"
                >
                  {{ b.name }}
                </option>
              </ng-container>
              <ng-container *ngIf="allowedType(p) !== 'Life'">
                <option *ngFor="let a of assetsForPolicy(p)" [value]="a.id">
                  {{ a.name }} — {{ a.type }}
                </option>
              </ng-container>
            </select>
          </div>
          <button (click)="buy(p)" class="buy">Buy</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        padding: 1rem;
      }
      .grid {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .card {
        background: #fff;
        padding: 12px;
        border-radius: 8px;
        width: 300px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
      }
      .code {
        color: #666;
        font-size: 12px;
      }
      .meta {
        margin-top: 8px;
        color: #333;
      }
      .buy {
        margin-top: 12px;
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
      }
    `,
  ],
})
export class MarketplaceComponent {
  policies: Policy[] = [];
  assets: Asset[] = [];
  beneficiaries: Array<{ id: string; name: string }> = [];
  loading = false;
  loadError = false;
  private base = `${environment.apiUrl}/api/beneficiaries`;

  constructor(
    private svc: PolicyService,
    private snack: SnackbarService,
    private assetSvc: AssetService,
    private http: HttpClient
  ) {
    this.load();
  }

  load() {
    this.loading = true;
    this.loadError = false;
    this.svc.catalog().subscribe({
      next: (p) => {
        this.policies = p || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load marketplace', err);
        this.policies = [];
        this.loading = false;
        this.loadError = true;
      },
    });
    this.assetSvc.mine().subscribe({
      next: (a) => (this.assets = a || []),
      error: () => (this.assets = []),
    });
    // load beneficiaries for life policies
    this.http
      .get<{ id: string; name: string }[]>(`${this.base}/mine`)
      .subscribe({
        next: (b) => (this.beneficiaries = b || []),
        error: () => (this.beneficiaries = []),
      });
  }

  buy(p: Policy) {
    this.loading = true;
    // if the user selected an asset or beneficiary for this policy, pick it up from a select element named by code
    const sel = document.querySelector<HTMLSelectElement>(
      `select[data-policy="${p.id}"]`
    );
    const value = sel ? sel.value || undefined : undefined;
    const isLife = this.allowedType(p) === 'Life';
    const assetId = !isLife ? value : undefined;
    const beneficiaryId = isLife ? value : undefined;
    this.svc.purchase(p.id, assetId, beneficiaryId).subscribe({
      next: () => {
        this.loading = false;
        this.snack.show('Policy added to your account', { type: 'success' });
      },
      error: (err) => {
        this.loading = false;
        this.snack.show('Failed to purchase policy', { type: 'error' });
        console.error(err);
      },
    });
  }

  // Determine which asset type a policy accepts based on its code or name
  allowedType(p: Policy): string | undefined {
    const code = (p.code || '').toUpperCase();
    if (code.startsWith('AUTO') || code.includes('AUTO')) return 'Auto';
    if (code.startsWith('HOME') || code.includes('HOME')) return 'Home';
    if (code.startsWith('LIFE') || code.includes('LIFE')) return 'Life';
    return undefined;
  }

  assetsForPolicy(p: Policy): Asset[] {
    const t = this.allowedType(p);
    if (!t) return this.assets;
    return (this.assets || []).filter((a) => a.type === t);
  }

  beneficiariesForPolicy(p: Policy) {
    // only for life policies
    const t = this.allowedType(p);
    if (t !== 'Life') return [];
    return this.beneficiaries || [];
  }
}
