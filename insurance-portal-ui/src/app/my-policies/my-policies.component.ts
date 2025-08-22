import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PolicyService, UserPolicy } from '../services/policy.service';
import { AssetService, Asset } from '../services/asset.service';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '../shared/snackbar.service';
import { ConfirmDialogService } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-my-policies',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
          <!-- If this policy supports life/bene, prefer showing beneficiary -->
          <div *ngIf="isLife(p)">
            <div *ngIf="p.beneficiaryId">
              Beneficiary:
              <a [routerLink]="['/beneficiaries', p.beneficiaryId]"
                ><strong>{{ getBeneficiaryName(p) }}</strong></a
              >
              <div class="muted" style="font-size:12px;">
                {{ getBeneficiaryRelationship(p) }}
                {{ getBeneficiaryPercentage(p) }}
              </div>
            </div>
            <div *ngIf="!p.beneficiaryId">
              <em>No beneficiary selected</em>
            </div>
          </div>
          <div *ngIf="!isLife(p) && p.assetId">
            Attached asset:
            <strong>{{ getAssetName(p) }}</strong>
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
  beneficiariesById: Record<
    string,
    { id: string; name: string; relationship?: string; percentage?: number }
  > = {};

  constructor(
    private svc: PolicyService,
    private assetSvc: AssetService,
    private snack: SnackbarService,
    private confirm: ConfirmDialogService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // defer loading until the component lifecycle so tests can instantiate
    // the class without triggering HTTP calls in the constructor.
    this.load();
  }

  load() {
    // load assets and policies in parallel and build an asset lookup map
    const beneficiaries$ = this.http
      .get<any[]>(`${environment.apiUrl}/api/beneficiaries/mine`)
      .pipe(
        catchError((err) => {
          console.error('Failed to load beneficiaries', err);
          return of([]);
        })
      );

    forkJoin({
      assets: this.assetSvc.mine(),
      policies: this.svc.mine(),
      beneficiaries: beneficiaries$,
    }).subscribe({
      next: ({ assets, policies, beneficiaries }) => {
        this.assets = assets || [];
        this.assetsById = {};
        this.assets.forEach(
          (a) => (this.assetsById[String(a.id).toLowerCase()] = a)
        );
        this.policies = policies || [];
        this.beneficiariesById = {};
        (beneficiaries || []).forEach(
          (b: any) =>
            (this.beneficiariesById[String(b.id).toLowerCase()] = {
              id: b.id,
              name: b.name,
              relationship: b.relationship,
              percentage: b.percentage,
            })
        );
      },
      error: (err) => {
        console.error('Failed to load policies or assets', err);
        this.snack.show('Failed to load policies', { type: 'error' });
        this.policies = [];
      },
    });
  }

  // Determine whether this user policy should be treated as a Life policy.
  // Some older policies may not have `supportedAssetType` populated, so fall
  // back to checking the policy code/name similar to the marketplace logic.
  isLife(p: UserPolicy) {
    const code = (p.policy?.code || '').toUpperCase();
    const name = (p.policy?.name || '').toUpperCase();
    if (p.policy?.supportedAssetType === 'Life') return true;
    if (code.includes('LIFE') || name.includes('LIFE')) return true;
    return false;
  }

  getBeneficiaryName(p: UserPolicy) {
    if (!p.beneficiaryId) return '';
    const key = String(p.beneficiaryId).toLowerCase();
    return this.beneficiariesById[key]?.name || 'Unknown';
  }

  getAssetName(p: UserPolicy) {
    if (!p.assetId) return '';
    const key = String(p.assetId).toLowerCase();
    return this.assetsById[key]?.name || 'Unknown';
  }

  getBeneficiaryRelationship(p: UserPolicy) {
    if (!p.beneficiaryId) return '';
    const key = String(p.beneficiaryId).toLowerCase();
    return this.beneficiariesById[key]?.relationship || '';
  }

  getBeneficiaryPercentage(p: UserPolicy) {
    if (!p.beneficiaryId) return '';
    const key = String(p.beneficiaryId).toLowerCase();
    const pct = this.beneficiariesById[key]?.percentage;
    return pct ? `— ${pct}%` : '';
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
