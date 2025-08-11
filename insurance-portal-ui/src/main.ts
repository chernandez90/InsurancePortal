import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/login/login.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { AuthInterceptor } from './app/services/auth.interceptor'; // Import your interceptor

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'claims-list',
    loadComponent: () =>
      import('./app/claims-list/claims-list.component').then(
        (c) => c.ClaimsListComponent
      ),
  },
  {
    path: 'claims',
    loadComponent: () =>
      import('./app/claims/claims.component').then((c) => c.ClaimsComponent),
  },
  {
    path: 'claim-form',
    loadComponent: () =>
      import('./app/claim-form/claim-form.component').then(
        (c) => c.ClaimFormComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./app/register/register.component').then(
        (c) => c.RegisterComponent
      ),
  },
  { path: '**', redirectTo: '/login' },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
