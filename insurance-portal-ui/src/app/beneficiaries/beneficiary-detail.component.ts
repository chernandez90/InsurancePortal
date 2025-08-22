import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-beneficiary-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page" *ngIf="b">
      <h2>{{ b.name }}</h2>
      <div *ngIf="b.relationship">Relationship: {{ b.relationship }}</div>
      <div *ngIf="b.percentage">Allocation: {{ b.percentage }}%</div>
      <div *ngIf="!b.relationship && !b.percentage">No additional details.</div>
    </div>
    <div *ngIf="!b">Loading beneficiary...</div>
  `,
})
export class BeneficiaryDetailComponent {
  b: any | null = null;
  constructor(route: ActivatedRoute, http: HttpClient) {
    const id = route.snapshot.paramMap.get('id');
    if (!id) return;
    http
      .get(`${environment.apiUrl}/api/beneficiaries/mine`)
      .subscribe((list: any) => {
        this.b =
          (list || []).find(
            (x: any) => String(x.id).toLowerCase() === id.toLowerCase()
          ) || null;
      });
  }
}
