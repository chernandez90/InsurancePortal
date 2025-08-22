import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Policy {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPremium: number;
  isActive: boolean;
}

export interface UserPolicy {
  id: string;
  policyId: string;
  effectiveDate: string;
  terminatedDate?: string | null;
  isActive: boolean;
  policy: Policy;
  assetId?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private base = `${environment.apiUrl}/api/policies`;
  constructor(private http: HttpClient) {}

  catalog(): Observable<Policy[]> {
    return this.http.get<any>(`${this.base}/catalog`).pipe(
      map((resp) => {
        // Accept either a raw array or an object with `policies` / `Policies`.
        if (Array.isArray(resp)) return resp as Policy[];
        if (resp == null) return [] as Policy[];
        return (resp.policies ?? resp.Policies ?? []) as Policy[];
      })
    );
  }

  purchase(policyId: string, assetId?: string | null) {
    const qs = assetId ? `?assetId=${assetId}` : '';
    return this.http.post(`${this.base}/${policyId}/purchase${qs}`, {});
  }

  mine() {
    return this.http.get<UserPolicy[]>(`${this.base}/mine`);
  }

  terminate(userPolicyId: string) {
    return this.http.post(`${this.base}/${userPolicyId}/terminate`, {});
  }
}
