import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClaimService, InsuranceClaim } from '../services/claim.service';
import { SignalRService } from '../services/signalr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-claims-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="claims-container">
      <!-- ADD THIS HEADER SECTION -->
      <header class="claims-header">
        <h2>Insurance Claims</h2>
        <div class="header-actions">
          <button (click)="goToDashboard()" class="btn btn-secondary">
            ← Back to Dashboard
          </button>
          <button (click)="logout()" class="btn btn-logout">Logout</button>
        </div>
      </header>

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
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
        background: #28a745;
        color: white;
      }

      .btn-logout {
        background: #dc3545;
        color: white;
      }

      .btn-secondary:hover {
        background: #218838;
      }

      .btn-logout:hover {
        background: #c82333;
      }

      .main-content {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .connection-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 20px;
      }

      .status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #dc3545;
      }

      .status-indicator.connected {
        background-color: #28a745;
      }

      .status-text {
        font-size: 0.9em;
        color: #666;
      }

      .updates-panel {
        background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
        border: 2px solid #2196f3;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 25px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .updates-panel h4 {
        margin: 0 0 15px 0;
        color: #1976d2;
      }

      .update-item {
        background-color: white;
        padding: 12px;
        margin: 8px 0;
        border-radius: 8px;
        font-size: 0.9em;
        border-left: 4px solid #2196f3;
        animation: slideIn 0.3s ease-out;
      }

      .update-time {
        color: #666;
        font-size: 0.8em;
        margin-right: 8px;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .claim-item {
        border: 2px solid #dee2e6;
        margin: 15px 0;
        padding: 20px;
        border-radius: 12px;
        transition: all 0.3s ease;
        background-color: white;
      }

      .claim-item:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .claim-item.new-claim {
        border-color: #28a745;
        background-color: #f8fff9;
        animation: glow 2s ease-in-out;
      }

      @keyframes glow {
        0%,
        100% {
          box-shadow: 0 0 5px rgba(40, 167, 69, 0.3);
        }
        50% {
          box-shadow: 0 0 20px rgba(40, 167, 69, 0.6);
        }
      }

      .claim-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .claim-header h3 {
        margin: 0;
        color: #343a40;
      }

      .policy-number {
        background-color: #6c757d;
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.85em;
        font-weight: 500;
      }

      .description {
        color: #495057;
        margin: 10px 0;
        line-height: 1.5;
      }

      .date-filed {
        color: #6c757d;
        font-size: 0.9em;
      }

      .add-claim-btn {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
        border: none;
        padding: 14px 28px;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 25px;
        font-size: 1.1em;
        font-weight: 500;
        transition: all 0.2s;
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
      }

      .add-claim-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 123, 255, 0.4);
      }

      .loading,
      .no-claims {
        text-align: center;
        padding: 40px;
        font-size: 1.1em;
        color: #6c757d;
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
    private signalRService: SignalRService
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
}
