import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private connectionStarted = false;
  private claimUpdatesSubject = new BehaviorSubject<string>('');

  // Expose the observable for components to subscribe to
  public claimUpdates$: Observable<string> =
    this.claimUpdatesSubject.asObservable();

  constructor() {}

  public startConnection(): Promise<void> {
    if (this.connectionStarted) {
      return Promise.resolve();
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.signalRUrl, {
        skipNegotiation: false, // Let SignalR negotiate the best transport
        transport: signalR.HttpTransportType.WebSockets,
        accessTokenFactory: () => {
          const token = localStorage.getItem('token');
          return token || '';
        },
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information) // Add logging
      .build();

    return this.hubConnection
      .start()
      .then(() => {
        console.log('✅ SignalR Connected to:', environment.signalRUrl);
        this.connectionStarted = true;
        this.addClaimUpdateListener();
      })
      .catch((err) => {
        console.error('❌ SignalR Connection Error:', err);
        this.connectionStarted = false;
        throw err;
      });
  }

  public stopConnection(): void {
    if (this.hubConnection && this.connectionStarted) {
      this.hubConnection.stop();
      this.connectionStarted = false;
    }
  }

  private addClaimUpdateListener(): void {
    if (this.hubConnection) {
      this.hubConnection.on('ReceiveClaimUpdate', (message: string) => {
        console.log('📢 Real-time update received:', message);
        // Emit the message through the BehaviorSubject
        this.claimUpdatesSubject.next(message);
      });
    }
  }

  public joinGroup(groupName: string): void {
    if (this.hubConnection && this.connectionStarted) {
      this.hubConnection
        .invoke('JoinGroup', groupName)
        .catch((err) => console.error('Error joining group:', err));
    }
  }

  public getConnectionState(): string {
    return this.hubConnection?.state || 'Disconnected';
  }

  public isConnected(): boolean {
    return (
      this.connectionStarted &&
      this.hubConnection?.state === signalR.HubConnectionState.Connected
    );
  }
}
