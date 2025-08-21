import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService, SnackbarItem } from './snackbar.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="snackbar-container" aria-live="polite" aria-atomic="true">
      <div *ngFor="let m of messages" class="snackbar" [ngClass]="m.type">
        <div class="msg">{{ m.message }}</div>
        <button class="close" (click)="dismiss(m.id)" aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .snackbar-container {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        display: flex;
        flex-direction: column-reverse;
        gap: 0.5rem;
        z-index: 9999;
        pointer-events: none;
      }
      .snackbar {
        pointer-events: auto;
        min-width: 200px;
        max-width: 360px;
        background: #323232;
        color: white;
        padding: 0.6rem 0.8rem;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
      }
      .snackbar.success {
        background: #2e7d32;
      }
      .snackbar.error {
        background: #c62828;
      }
      .snackbar.info {
        background: #1565c0;
      }
      .snackbar .msg {
        flex: 1 1 auto;
        margin-right: 0.5rem;
      }
      .snackbar .close {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.9);
        font-size: 1rem;
        cursor: pointer;
      }
    `,
  ],
})
export class SnackbarComponent {
  messages: SnackbarItem[] = [];

  constructor(private snack: SnackbarService) {
    this.snack.messages$.subscribe((list) => (this.messages = list));
  }

  dismiss(id: string) {
    this.snack.dismiss(id);
  }
}
