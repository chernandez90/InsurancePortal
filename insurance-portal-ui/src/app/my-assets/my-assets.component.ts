import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetService, Asset } from '../services/asset.service';
import { PolicyService, UserPolicy } from '../services/policy.service';
import { SnackbarService } from '../shared/snackbar.service';

@Component({
  selector: 'app-my-assets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>My Assets</h2>
      <p>
        Manage assets you want to insure and view policies tied to each asset.
      </p>

      <form (submit)="create($any($event).target)" class="create-form">
        <input class="txt" placeholder="Name" name="name" required />
        <select
          class="txt"
          name="type"
          required
          (change)="onTypeChange($any($event).target.value)"
        >
          <option value="">Select type...</option>
          <option value="Auto">Auto</option>
          <option value="Home">Home</option>
          <option value="Rental">Rental</option>
          <option value="Boat">Boat</option>
          <option value="RV">RV</option>
        </select>
        <input class="txt" placeholder="Description" name="description" />

        <!-- Vehicle fields -->
        <select
          *ngIf="newType === 'Auto'"
          class="txt"
          name="vehicleMake"
          (change)="onMakeChange($any($event).target.value)"
        >
          <option value="">Select make...</option>
          <option *ngFor="let m of vehicleMakes" [value]="m">{{ m }}</option>
        </select>

        <select
          *ngIf="newType === 'Auto'"
          class="txt"
          name="vehicleModel"
          [disabled]="!selectedMake"
          (change)="onModelChange($any($event).target.value)"
        >
          <option value="">Select model...</option>
          <option *ngFor="let mo of availableModels" [value]="mo.name">
            {{ mo.name }}
          </option>
        </select>

        <select
          *ngIf="newType === 'Auto'"
          class="txt"
          name="vehicleYear"
          [disabled]="!selectedModel"
        >
          <option value="">Select year...</option>
          <option *ngFor="let y of availableYears" [value]="y">{{ y }}</option>
        </select>
        <input
          *ngIf="newType === 'Auto'"
          class="txt"
          placeholder="VIN"
          name="vin"
        />
        <input
          *ngIf="newType === 'Auto'"
          class="txt"
          placeholder="License Plate"
          name="licensePlate"
        />
        <input
          *ngIf="newType === 'Auto'"
          class="txt"
          placeholder="Odometer"
          name="odometer"
          type="number"
        />

        <!-- Home fields -->
        <input
          *ngIf="newType === 'Home'"
          class="txt"
          placeholder="Address"
          name="address"
        />
        <input
          *ngIf="newType === 'Home'"
          class="txt"
          placeholder="Year Built"
          name="yearBuilt"
          type="number"
        />
        <input
          *ngIf="newType === 'Home'"
          class="txt"
          placeholder="Square Feet"
          name="squareFeet"
          type="number"
        />
        <input
          *ngIf="newType === 'Home'"
          class="txt"
          placeholder="Bedrooms"
          name="bedrooms"
          type="number"
        />
        <input
          *ngIf="newType === 'Home'"
          class="txt"
          placeholder="Bathrooms"
          name="bathrooms"
          type="number"
        />

        <!-- Rental fields -->
        <input
          *ngIf="newType === 'Rental'"
          class="txt"
          placeholder="Address"
          name="address"
        />
        <input
          *ngIf="newType === 'Rental'"
          class="txt"
          placeholder="Unit Number"
          name="unitNumber"
        />
        <input
          *ngIf="newType === 'Rental'"
          class="txt"
          placeholder="Landlord Name"
          name="landlordName"
        />

        <button type="submit" class="buy">Add Asset</button>
      </form>

      <div *ngIf="assets.length === 0">No assets yet.</div>

      <div class="list">
        <div class="item" *ngFor="let a of assets">
          <h3>
            {{ a.name }} <small class="type">{{ a.type }}</small>
          </h3>
          <div>{{ a.description }}</div>
          <div class="meta">Added: {{ a.createdAt | date : 'short' }}</div>
          <div class="details">
            <!-- Auto details -->
            <div *ngIf="a.type === 'Auto'">
              <div><strong>Make:</strong> {{ a.vehicleMake || '—' }}</div>
              <div><strong>Model:</strong> {{ a.vehicleModel || '—' }}</div>
              <div><strong>Year:</strong> {{ a.vehicleYear || '—' }}</div>
              <div *ngIf="a.vin"><strong>VIN:</strong> {{ a.vin }}</div>
              <div *ngIf="a.licensePlate">
                <strong>License Plate:</strong> {{ a.licensePlate }}
              </div>
              <div *ngIf="a.odometer !== null && a.odometer !== undefined">
                <strong>Odometer:</strong> {{ a.odometer }}
              </div>
            </div>

            <!-- Home details -->
            <div *ngIf="a.type === 'Home'">
              <div><strong>Address:</strong> {{ a.address || '—' }}</div>
              <div><strong>Year Built:</strong> {{ a.yearBuilt || '—' }}</div>
              <div *ngIf="a.squareFeet !== null && a.squareFeet !== undefined">
                <strong>Square Feet:</strong> {{ a.squareFeet }}
              </div>
              <div *ngIf="a.bedrooms !== null && a.bedrooms !== undefined">
                <strong>Bedrooms:</strong> {{ a.bedrooms }}
              </div>
              <div *ngIf="a.bathrooms !== null && a.bathrooms !== undefined">
                <strong>Bathrooms:</strong> {{ a.bathrooms }}
              </div>
            </div>

            <!-- Rental details -->
            <div *ngIf="a.type === 'Rental'">
              <div><strong>Address:</strong> {{ a.address || '—' }}</div>
              <div *ngIf="a.unitNumber">
                <strong>Unit #:</strong> {{ a.unitNumber }}
              </div>
              <div *ngIf="a.landlordName">
                <strong>Landlord:</strong> {{ a.landlordName }}
              </div>
            </div>

            <!-- Generic fields for Boat, RV, etc. -->
            <div
              *ngIf="
                a.type !== 'Auto' &&
                a.type !== 'Home' &&
                a.type !== 'Life' &&
                a.type !== 'Rental'
              "
            >
              <div *ngIf="a.description">
                <strong>Details:</strong> {{ a.description }}
              </div>
            </div>
          </div>
          <div class="actions">
            <button class="terminate" (click)="remove(a.id)">Delete</button>
          </div>

          <div *ngIf="policiesByAsset[a.id]?.length">
            <h4>Policies for this asset</h4>
            <ul>
              <li *ngFor="let up of policiesByAsset[a.id]">
                {{ up.policy.name }} ({{ up.effectiveDate | date }})
              </li>
            </ul>
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
      .create-form {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }
      .create-form .txt {
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid #ddd;
        min-width: 160px;
      }
      .create-form .buy {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
      }
      .create-form .buy:hover {
        filter: brightness(0.95);
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
      }
      .type {
        color: #666;
      }
      .actions {
        margin-top: 8px;
      }
      .actions .terminate {
        background: #dc3545;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
      }
      .actions .terminate:hover {
        filter: brightness(0.95);
      }
    `,
  ],
})
export class MyAssetsComponent {
  assets: Asset[] = [];
  policiesByAsset: Record<string, UserPolicy[]> = {};
  newType = '';
  // Vehicle make/model/year helpers
  vehicleMakes = [
    'Toyota',
    'Honda',
    'Ford',
    'Chevrolet',
    'Nissan',
    'BMW',
    'Mercedes',
    'Volkswagen',
    'Hyundai',
    'Kia',
    'Subaru',
  ];

  modelsByMake: Record<
    string,
    { name: string; minYear?: number; maxYear?: number }[]
  > = {
    Toyota: [
      { name: 'Camry', minYear: 1990, maxYear: new Date().getFullYear() },
      { name: 'Corolla', minYear: 1990, maxYear: new Date().getFullYear() },
      { name: 'RAV4', minYear: 1996, maxYear: new Date().getFullYear() },
    ],
    Honda: [
      { name: 'Civic', minYear: 1992, maxYear: new Date().getFullYear() },
      { name: 'Accord', minYear: 1990, maxYear: new Date().getFullYear() },
      { name: 'CR-V', minYear: 1996, maxYear: new Date().getFullYear() },
    ],
    Ford: [
      { name: 'F-150', minYear: 1990, maxYear: new Date().getFullYear() },
      { name: 'Focus', minYear: 1998, maxYear: 2018 },
      { name: 'Escape', minYear: 2000, maxYear: new Date().getFullYear() },
    ],
    Chevrolet: [
      { name: 'Silverado', minYear: 1999, maxYear: new Date().getFullYear() },
      { name: 'Malibu', minYear: 1997, maxYear: new Date().getFullYear() },
    ],
    Nissan: [
      { name: 'Altima', minYear: 1993, maxYear: new Date().getFullYear() },
      { name: 'Sentra', minYear: 1990, maxYear: new Date().getFullYear() },
    ],
    BMW: [
      { name: '3 Series', minYear: 1990, maxYear: new Date().getFullYear() },
      { name: '5 Series', minYear: 1990, maxYear: new Date().getFullYear() },
    ],
    Mercedes: [
      { name: 'C-Class', minYear: 1993, maxYear: new Date().getFullYear() },
      { name: 'E-Class', minYear: 1993, maxYear: new Date().getFullYear() },
    ],
    Volkswagen: [
      { name: 'Golf', minYear: 1990, maxYear: new Date().getFullYear() },
      { name: 'Jetta', minYear: 1990, maxYear: new Date().getFullYear() },
    ],
    Hyundai: [
      { name: 'Elantra', minYear: 1995, maxYear: new Date().getFullYear() },
      { name: 'Santa Fe', minYear: 2001, maxYear: new Date().getFullYear() },
    ],
    Kia: [
      { name: 'Sorento', minYear: 2002, maxYear: new Date().getFullYear() },
      { name: 'Optima', minYear: 2000, maxYear: new Date().getFullYear() },
    ],
    Subaru: [
      { name: 'Outback', minYear: 1995, maxYear: new Date().getFullYear() },
      { name: 'Impreza', minYear: 1992, maxYear: new Date().getFullYear() },
    ],
  };

  selectedMake = '';
  selectedModel = '';
  availableModels: { name: string; minYear?: number; maxYear?: number }[] = [];
  availableYears: number[] = [];

  constructor(
    private svc: AssetService,
    private policySvc: PolicyService,
    private snack: SnackbarService
  ) {
    this.load();
  }

  load() {
    this.svc.mine().subscribe({
      next: (a) => {
        this.assets = a || [];
        this.loadPolicies();
      },
      error: (err) => {
        console.error(err);
        this.snack.show('Failed to load assets', { type: 'error' });
      },
    });
  }

  loadPolicies() {
    this.policySvc.mine().subscribe({
      next: (p) => {
        this.policiesByAsset = {};
        (p || []).forEach((up) => {
          if (!up.assetId) return;
          const key = up.assetId;
          if (!this.policiesByAsset[key]) this.policiesByAsset[key] = [];
          this.policiesByAsset[key].push(up);
        });
      },
      error: (err) => console.error('failed to load user policies', err),
    });
  }

  create(form: HTMLFormElement) {
    const fd = new FormData(form);
    const payload: any = {
      name: fd.get('name') as string,
      type: fd.get('type') as string,
      description: fd.get('description') as string,
    };

    const t = (fd.get('type') as string) || '';
    if (t === 'Auto') {
      const vehicleYear = fd.get('vehicleYear');
      payload.vehicleMake = fd.get('vehicleMake') as string;
      payload.vehicleModel = fd.get('vehicleModel') as string;
      payload.vehicleYear = vehicleYear ? Number(vehicleYear as string) : null;
      payload.vin = fd.get('vin') as string;
      payload.licensePlate = fd.get('licensePlate') as string;
      const odo = fd.get('odometer');
      payload.odometer = odo ? Number(odo as string) : null;
    }
    if (t === 'Home') {
      const yearBuilt = fd.get('yearBuilt');
      payload.address = fd.get('address') as string;
      payload.yearBuilt = yearBuilt ? Number(yearBuilt as string) : null;
      payload.squareFeet = fd.get('squareFeet')
        ? Number(fd.get('squareFeet') as string)
        : null;
      payload.bedrooms = fd.get('bedrooms')
        ? Number(fd.get('bedrooms') as string)
        : null;
      payload.bathrooms = fd.get('bathrooms')
        ? Number(fd.get('bathrooms') as string)
        : null;
    }
    if (t === 'Life') {
      payload.dateOfBirth = fd.get('dateOfBirth') as string;
      payload.coverageAmount = fd.get('coverageAmount')
        ? Number(fd.get('coverageAmount') as string)
        : null;
      payload.beneficiary = fd.get('beneficiary') as string;
    }
    if (t === 'Rental') {
      payload.address = fd.get('address') as string;
      payload.unitNumber = fd.get('unitNumber') as string;
      payload.landlordName = fd.get('landlordName') as string;
    }
    this.svc.create(payload).subscribe({
      next: () => {
        this.snack.show('Asset added', { type: 'success' });
        form.reset();
        this.load();
      },
      error: (err) => {
        console.error(err);
        this.snack.show('Failed to add asset', { type: 'error' });
      },
    });
    return false;
  }

  remove(id: string) {
    this.svc.delete(id).subscribe({
      next: () => {
        this.snack.show('Asset deleted', { type: 'success' });
        this.load();
      },
      error: (err) => {
        console.error(err);
        this.snack.show('Failed to delete asset', { type: 'error' });
      },
    });
  }

  onTypeChange(v: string) {
    this.newType = v;
  }

  onMakeChange(make: string) {
    this.selectedMake = make;
    this.selectedModel = '';
    this.availableModels = this.modelsByMake[make] ?? [];
    this.availableYears = [];
  }

  onModelChange(modelName: string) {
    this.selectedModel = modelName;
    const model = this.availableModels.find((m) => m.name === modelName);
    const currentYear = new Date().getFullYear();
    const minY = model?.minYear ?? 1990;
    const maxY = model?.maxYear ?? currentYear;
    const years: number[] = [];
    for (let y = maxY; y >= minY; y--) years.push(y);
    this.availableYears = years;
  }
}
