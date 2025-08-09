import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ClaimService } from './services/claim.service';
import { SignalRService } from './services/signalr.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-container">
      <header>
        <h1>🏢 Insurance Portal</h1>
        <p>Enterprise Claims Management System</p>
        <div class="connection-status">
          <span [class]="apiConnected ? 'status-connected' : 'status-disconnected'">
            API: {{ apiConnected ? '✅ Connected' : '❌ Disconnected' }}
          </span>
          <span [class]="signalRConnected ? 'status-connected' : 'status-disconnected'">
            SignalR: {{ signalRConnected ? '✅ Connected' : '❌ Disconnected' }}
          </span>
        </div>
      </header>
      
      <main class="main-content">
        <div class="info-card">
          <h2>🎯 System Information</h2>
          <div class="info-item">
            <strong>API URL:</strong> <code>{{ apiUrl }}</code>
          </div>
          <div class="info-item">
            <strong>SignalR URL:</strong> <code>{{ signalRUrl }}</code>
          </div>
          <div class="info-item">
            <strong>Environment:</strong> {{ environment.production ? 'Production' : 'Development' }}
          </div>
        </div>

        <div class="claims-card">
          <h2>📋 Claims Management</h2>
          <div class="actions">
            <button (click)="loadClaims()" [disabled]="!apiConnected" class="btn btn-primary">
              🔄 Load Claims ({{ claims.length }})
            </button>
            <button (click)="testSignalR()" [disabled]="!signalRConnected" class="btn btn-secondary">
              📡 Test Real-time
            </button>
          </div>
          <div class="claims-list">
            <div *ngIf="isLoading">Loading claims...</div>
            <div *ngIf="!isLoading && claims.length === 0">
              No claims found. {{ apiConnected ? 'Try loading claims.' : 'API connection required.' }}
            </div>
            <div *ngFor="let claim of claims" class="claim-item">
              <strong>Policy:</strong> {{ claim.policyNumber }} <br>
              <strong>Description:</strong> {{ claim.description }}
            </div>
          </div>
        </div>

        <div class="realtime-card">
          <h2>📡 Real-time Updates</h2>
          <div class="realtime-log">
            <div *ngIf="realtimeMessages.length === 0">Waiting for real-time messages...</div>
            <div *ngFor="let message of realtimeMessages" class="message">
              {{ message }}
            </div>
          </div>
        </div>

        <div class="links-card">
          <h2>🔗 Quick Links</h2>
          <div class="links">
            <a [href]="apiUrl + '/swagger'" target="_blank" class="btn btn-primary">📚 API Documentation</a>
            <a [href]="apiUrl + '/health'" target="_blank" class="btn btn-secondary">🏥 Health Check</a>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: white;
      padding: 20px;
    }

    header {
      text-align: center;
      margin-bottom: 30px;
    }

    header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .connection-status {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 15px 0;
      font-weight: 600;
    }

    .status-connected { color: #28a745; }
    .status-disconnected { color: #dc3545; }

    .main-content {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      gap: 20px;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    }

    .info-card, .claims-card, .realtime-card, .links-card {
      background: rgba(255,255,255,0.1);
      padding: 25px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }

    .info-card h2, .claims-card h2, .realtime-card h2, .links-card h2 {
      margin: 0 0 20px 0;
      font-size: 1.5rem;
    }

    .info-item {
      margin: 15px 0;
      word-break: break-all;
    }

    code {
      background: rgba(255,255,255,0.2);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.9em;
    }

    .actions, .links {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      text-decoration: none;
      display: inline-block;
      text-align: center;
      transition: all 0.3s ease;
      color: white;
    }

    .btn-primary {
      background: rgba(40, 167, 69, 0.8);
    }

    .btn-secondary {
      background: rgba(108, 117, 125, 0.8);
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .claims-list {
      min-height: 100px;
    }

    .claim-item {
      background: rgba(255,255,255,0.1);
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
    }

    .realtime-log {
      background: rgba(0,0,0,0.2);
      padding: 15px;
      border-radius: 8px;
      min-height: 100px;
      max-height: 200px;
      overflow-y: auto;
    }

    .message {
      margin: 5px 0;
      padding: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      font-size: 0.9em;
    }

    @media (max-width: 768px) {
      header h1 { font-size: 2rem; }
      .main-content { grid-template-columns: 1fr; }
      .actions, .links { flex-direction: column; }
      .connection-status { flex-direction: column; gap: 10px; }
    }
  `]
})
export class AppComponent implements OnInit {
  apiUrl = environment.apiUrl;
  signalRUrl = environment.signalRUrl;
  environment = environment;

  apiConnected = false;
  signalRConnected = false;
  isLoading = false;
  claims: any[] = [];
  realtimeMessages: string[] = [];

  constructor(
    private http: HttpClient,
    private claimService: ClaimService,
    private signalRService: SignalRService
  ) { }

  async ngOnInit() {
    console.log('🚀 Insurance Portal starting...');
    console.log('📡 API URL:', this.apiUrl);
    console.log('🔗 SignalR URL:', this.signalRUrl);

    await this.checkApiConnection();
    await this.initializeSignalR();
  }

  private async checkApiConnection() {
    try {
      const response = await this.http.get(`${this.apiUrl}/health`).toPromise();
      this.apiConnected = true;
      console.log('✅ API connection successful:', response);
    } catch (error) {
      console.error('❌ API connection failed:', error);
      this.apiConnected = false;
    }
  }

  private async initializeSignalR() {
    try {
      await this.signalRService.startConnection();
      this.signalRConnected = this.signalRService.isConnected();

      // Subscribe to claim updates
      this.signalRService.claimUpdates$.subscribe(message => {
        if (message) {
          const timestamp = new Date().toLocaleTimeString();
          this.realtimeMessages.unshift(`${timestamp}: ${message}`);
          if (this.realtimeMessages.length > 10) {
            this.realtimeMessages = this.realtimeMessages.slice(0, 10);
          }
        }
      });

      console.log('✅ SignalR connection established');
    } catch (error) {
      console.error('❌ SignalR connection failed:', error);
      this.signalRConnected = false;
    }
  }

  async loadClaims() {
    if (!this.apiConnected) return;

    this.isLoading = true;
    try {
      this.claims = await this.claimService.getAllClaims().toPromise() || [];
      console.log('📋 Claims loaded:', this.claims.length);
    } catch (error) {
      console.error('❌ Failed to load claims:', error);
      this.claims = [];
    }
    this.isLoading = false;
  }

  testSignalR() {
    if (this.signalRConnected) {
      const timestamp = new Date().toLocaleTimeString();
      this.realtimeMessages.unshift(`${timestamp}: Test message sent from frontend`);
      console.log('📡 SignalR test message sent');
    }
  }
}
