import 'zone.js'; // Add this line at the very top

import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { ClaimsListComponent } from './app/claims-list/claims-list.component';
import { ClaimFormComponent } from './app/claim-form/claim-form.component';
import { LoginComponent } from './app/login/login.component';
import { RegisterComponent } from './app/register/register.component';
import { AuthInterceptor } from './app/services/auth.interceptor';
import { AuthGuard } from './app/services/auth.guard';
import { SignalRService } from './app/services/signalr.service';
import { provideServiceWorker } from '@angular/service-worker';

const routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' as const },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'claims', component: ClaimsListComponent, canActivate: [AuthGuard] },
  {
    path: 'claim-form',
    component: ClaimFormComponent,
    canActivate: [AuthGuard],
  },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    SignalRService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
}).catch((err) => console.error(err));
