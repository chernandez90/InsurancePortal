import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProfilePayload {
  username?: string;
  firstName: string;
  lastName: string;
  email?: string;
  address?: string;
  phone?: string;
  dob?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/api/CustomerProfile`;

  constructor(private http: HttpClient) {}

  createProfile(
    payload: ProfilePayload,
    token?: string | null
  ): Observable<any> {
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.post<any>(this.apiUrl, payload, { headers });
  }

  getProfile(token?: string | null): Observable<ProfilePayload> {
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.get<ProfilePayload>(this.apiUrl, { headers });
  }

  updateProfile(
    payload: ProfilePayload,
    token?: string | null
  ): Observable<any> {
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.put<any>(this.apiUrl, payload, { headers });
  }
}
