import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { AuthGuard } from './app/services/auth.guard';
import { LoginComponent } from './app/login/login.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { AuthInterceptor } from './app/services/auth.interceptor'; // Import your interceptor

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'claims-list',
    loadComponent: () =>
      import('./app/claims-list/claims-list.component').then(
        (c) => c.ClaimsListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'claim-form',
    loadComponent: () =>
      import('./app/claim-form/claim-form.component').then(
        (c) => c.ClaimFormComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./app/register/register.component').then(
        (c) => c.RegisterComponent
      ),
  },
  {
    path: 'profile-setup',
    loadComponent: () =>
      import('./app/onboarding/onboarding.component').then(
        (c) => c.OnboardingComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./app/profile/profile.component').then((c) => c.ProfileComponent),
    canActivate: [AuthGuard],
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
