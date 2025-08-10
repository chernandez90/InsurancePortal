import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor() {}

  public startConnection(): Promise<void> {
    const token = localStorage.getItem('token');

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}`, {
        accessTokenFactory: () => token || '',
        transport: environment.production
          ? signalR.HttpTransportType.ServerSentEvents |
            signalR.HttpTransportType.LongPolling // Use fallback transports in production
          : signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.ServerSentEvents |
            signalR.HttpTransportType.LongPolling, // All transports in dev
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    return this.hubConnection
      .start()
      .then(() => {
        console.log('✅ SignalR Connection started successfully');
        this.connectionStatusSubject.next(true);
      })
      .catch((err) => {
        console.error('❌ SignalR Connection Error:', err);
        this.connectionStatusSubject.next(false);

        // Don't throw error in production - graceful degradation
        if (!environment.production) {
          throw err;
        }
      });
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection
        .stop()
        .then(() => {
          console.log('SignalR connection stopped');
          this.connectionStatusSubject.next(false);
        })
        .catch((err) =>
          console.error('Error stopping SignalR connection:', err)
        );
    }
  }

  public onClaimUpdate(callback: (message: string) => void): void {
    if (this.hubConnection) {
      this.hubConnection.on('ClaimUpdated', callback);
    }
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }
}
