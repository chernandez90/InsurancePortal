import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ClaimService, InsuranceClaim } from '../services/claim.service';
import { SignalRService } from '../services/signalr.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../shared/header.component';

@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div class="claims-container">
      <!-- Move connection status inside main content -->
      <div class="main-content">
        <div class="connection-status">
          <span
            class="status-indicator"
            [class.connected]="isConnected"
            [class.disconnected]="!isConnected"
          ></span>
          <span class="status-text">{{ connectionStatus }}</span>
        </div>

        <!-- Real-time Updates Panel -->
        <div *ngIf="realtimeMessages.length > 0" class="updates-panel">
          <h4>🔄 Recent Updates</h4>
          <div
            *ngFor="let message of realtimeMessages.slice(0, 3)"
            class="update-item"
          >
            <span class="update-time">{{ getCurrentTime() }}</span>
            {{ message }}
          </div>
        </div>

        <div *ngIf="loading" class="loading">⏳ Loading claims...</div>

        <div *ngIf="!loading && claims.length === 0" class="no-claims">
          📋 No claims found.
        </div>

        <div *ngIf="!loading && claims.length > 0" class="claims-list">
          <div
            *ngFor="let claim of claims"
            class="claim-item"
            [class.new-claim]="isNewClaim(claim.id)"
          >
            <div class="claim-header">
              <h3>🏥 Claim #{{ claim.id }}</h3>
              <span class="policy-number"
                >Policy: {{ claim.policyNumber }}</span
              >
            </div>
            <p class="description">{{ claim.description }}</p>
            <span class="date-filed"
              >📅 Filed: {{ claim.dateFiled | date : 'short' }}</span
            >
          </div>
        </div>

        <button class="add-claim-btn" routerLink="/claim-form">
          ➕ Submit New Claim
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .claims-container {
        min-height: 100vh;
        background-color: #f5f5f5;
        padding: 1rem;
      }

      .claims-header {
        background: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .claims-header h2 {
        margin: 0;
        color: #333;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }

      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }

      .btn-secondary {
        background: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background: #545b62;
      }

      .btn-logout {
        background: #dc3545;
        color: white;
      }

      .btn-logout:hover {
        background: #c82333;
      }

      .main-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .connection-status {
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
      }

      .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #dc3545;
      }

      .status-indicator.connected {
        background-color: #28a745;
      }

      .status-text {
        font-size: 0.9em;
        color: #666;
        font-weight: 500;
      }

      .updates-panel {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .updates-panel h4 {
        margin: 0 0 1rem 0;
        color: #007bff;
        font-size: 1.1rem;
      }

      .update-item {
        background-color: white;
        padding: 0.75rem;
        margin: 0.5rem 0;
        border-radius: 6px;
        font-size: 0.9em;
        border-left: 3px solid #007bff;
      }

      .claim-item {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        margin: 1rem 0;
        padding: 1.5rem;
        border-radius: 8px;
      }

      .claim-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .claim-header h3 {
        margin: 0;
        color: #007bff;
        font-size: 1.2rem;
      }

      .policy-number {
        background-color: #6c757d;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.85em;
        font-weight: 500;
      }

      .description {
        color: #666;
        margin: 0.75rem 0;
        line-height: 1.5;
      }

      .date-filed {
        color: #999;
        font-size: 0.9em;
      }

      .add-claim-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 1.5rem;
        font-size: 1rem;
        font-weight: 500;
        text-decoration: none;
        display: inline-block;
      }

      .add-claim-btn:hover {
        background: #0056b3;
      }

      .loading,
      .no-claims {
        text-align: center;
        padding: 2rem;
        color: #666;
        font-size: 1.1rem;
      }
    `,
  ],
})
export class ClaimsListComponent implements OnInit, OnDestroy {
  claims: InsuranceClaim[] = [];
  loading = false;
  realtimeMessages: string[] = [];
  private signalRSubscription?: Subscription;
  private newClaimIds: Set<number> = new Set();
  isConnected = false;
  connectionStatus = 'Disconnected';

  constructor(
    private claimService: ClaimService,
    private signalRService: SignalRService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClaims();

    // Start SignalR connection with error handling
    this.signalRService
      .startConnection()
      .then(() => {
        console.log('✅ SignalR connected successfully');
        this.setupSignalRListeners();
      })
      .catch((error) => {
        console.log(
          '⚠️ SignalR connection failed, continuing without real-time updates'
        );
        // App continues to work without real-time features
      });

    this.signalRService.connectionStatus$.subscribe((status) => {
      this.isConnected = status;
      this.connectionStatus = status ? 'Connected' : 'Disconnected';
    });
  }

  ngOnDestroy(): void {
    this.signalRService.stopConnection();
    this.signalRSubscription?.unsubscribe();
  }

  loadClaims(): void {
    this.loading = true;
    this.claimService.getAllClaims().subscribe({
      next: (claims) => {
        this.claims = claims;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading claims:', error);
        this.loading = false;
      },
    });
  }

  private setupSignalRListeners(): void {
    this.signalRService.onClaimUpdate((message: string) => {
      this.realtimeMessages.unshift(message);
      this.realtimeMessages = this.realtimeMessages.slice(0, 5);
      this.loadClaims(); // Refresh claims list
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString();
  }

  isNewClaim(claimId: number): boolean {
    return this.newClaimIds.has(claimId);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
