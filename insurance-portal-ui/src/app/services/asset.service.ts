import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Asset {
  id: string;
  userId: number;
  type: string;
  name: string;
  description: string;
  createdAt: string;
  // vehicle
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYear?: number | null;
  vin?: string | null;
  licensePlate?: string | null;
  odometer?: number | null;
  // home
  address?: string | null;
  yearBuilt?: number | null;
  squareFeet?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  // life
  dateOfBirth?: string | null;
  coverageAmount?: number | null;
  beneficiary?: string | null;
  // rental
  unitNumber?: string | null;
  landlordName?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AssetService {
  private base = `${environment.apiUrl}/api/assets`;
  constructor(private http: HttpClient) {}

  mine(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.base}/mine`);
  }

  create(data: Partial<Asset>) {
    return this.http.post<Asset>(this.base, data);
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
