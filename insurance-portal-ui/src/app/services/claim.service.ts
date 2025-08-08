import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface InsuranceClaim {
  id: number;
  policyNumber: string;
  description: string;
  dateFiled: string;
}

export interface ClaimDto {
  policyNumber: string;
  description: string;
  dateFiled: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClaimService {
  private apiUrl = `${environment.apiUrl}/api/claims`;

  constructor(private http: HttpClient) {}

  getAllClaims(): Observable<InsuranceClaim[]> {
    return this.http.get<InsuranceClaim[]>(this.apiUrl);
  }

  submitClaim(claim: ClaimDto): Observable<InsuranceClaim> {
    return this.http.post<InsuranceClaim>(this.apiUrl, claim);
  }
}
