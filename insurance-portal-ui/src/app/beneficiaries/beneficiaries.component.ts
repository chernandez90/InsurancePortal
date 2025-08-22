import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface Beneficiary {
  id: string;
  name: string;
  relationship?: string;
  percentage?: number;
}

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <h2>Beneficiaries</h2>
      <p>Manage beneficiaries for life insurance policies.</p>

      <form
        (submit)="add($any($event).target); $event.preventDefault()"
        class="create-form"
      >
        <input class="txt" name="name" placeholder="Name" required />
        <select class="txt" name="relationship">
          <option value="">Relationship (optional)</option>
          <option value="Spouse">Spouse</option>
          <option value="Child">Child</option>
          <option value="Parent">Parent</option>
          <option value="Sibling">Sibling</option>
          <option value="Partner">Partner</option>
          <option value="Friend">Friend</option>
          <option value="Other">Other</option>
        </select>
        <input
          class="txt"
          name="percentage"
          placeholder="Percentage"
          type="number"
        />
        <button class="buy" type="submit">Add Beneficiary</button>
      </form>

      <div *ngIf="list.length === 0">No beneficiaries yet.</div>
      <ul>
        <li *ngFor="let b of list">
          <a [routerLink]="['/beneficiaries', b.id]"
            ><strong>{{ b.name }}</strong></a
          >
          <span *ngIf="b.relationship"> — {{ b.relationship }}</span>
          <span *ngIf="b.percentage"> ({{ b.percentage }}%)</span>
          <button class="terminate" (click)="remove(b.id)">Remove</button>
        </li>
      </ul>
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
      .txt {
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid #ddd;
      }
      .buy {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
      }
      .terminate {
        margin-left: 8px;
        background: #dc3545;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 6px;
      }
    `,
  ],
})
export class BeneficiariesComponent {
  list: Beneficiary[] = [];
  private base = `${environment.apiUrl}/api/beneficiaries`;

  constructor(private http: HttpClient) {
    this.load();
  }

  load() {
    this.http.get<Beneficiary[]>(`${this.base}/mine`).subscribe({
      next: (b) => (this.list = b || []),
      error: (err) => {
        console.error('failed to load beneficiaries', err);
        this.list = [];
      },
    });
  }

  add(form: HTMLFormElement) {
    const fd = new FormData(form);
    const name = fd.get('name') as string;
    if (!name) return;
    const payload = {
      name,
      relationship: (fd.get('relationship') as string) || undefined,
      percentage: fd.get('percentage')
        ? Number(fd.get('percentage') as string)
        : undefined,
    } as any;
    this.http.post<Beneficiary>(this.base, payload).subscribe({
      next: () => {
        form.reset();
        this.load();
      },
      error: (err) => console.error('failed to create beneficiary', err),
    });
  }

  remove(id: string) {
    this.http.delete(`${this.base}/${id}`).subscribe({
      next: () => this.load(),
      error: (err) => console.error('failed to delete beneficiary', err),
    });
  }
}
