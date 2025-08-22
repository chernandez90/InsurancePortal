import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export interface VehicleModel {
  name: string;
  minYear?: number;
  maxYear?: number;
}

export interface VehicleCatalog {
  makes: string[];
  modelsByMake: Record<string, VehicleModel[]>;
}

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private url = '/assets/vehicle-makes.json';
  constructor(private http: HttpClient) {}

  loadCatalog() {
    return this.http
      .get<VehicleCatalog>(this.url)
      .pipe(catchError(() => of(null)));
  }
}
