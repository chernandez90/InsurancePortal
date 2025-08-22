import {
  Component,
  EventEmitter,
  Input,
  Output,
  Injectable,
  ApplicationRef,
  Injector,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cd-overlay">
      <div class="cd-dialog">
        <div class="cd-message">{{ message }}</div>
        <div class="cd-actions">
          <button class="cd-btn cd-cancel" (click)="onCancel()">Cancel</button>
          <button class="cd-btn cd-confirm" (click)="onConfirm()">
            Confirm
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cd-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.45);
        z-index: 1100;
      }
      .cd-dialog {
        background: #fff;
        padding: 16px;
        border-radius: 8px;
        width: 320px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
      }
      .cd-message {
        margin-bottom: 12px;
      }
      .cd-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      .cd-btn {
        padding: 8px 12px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
      }
      .cd-cancel {
        background: #f1f1f1;
      }
      .cd-confirm {
        background: #dc3545;
        color: white;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input() message = 'Are you sure?';
  @Output() closed = new EventEmitter<boolean>();

  onConfirm() {
    this.closed.emit(true);
  }

  onCancel() {
    this.closed.emit(false);
  }
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  constructor(private injector: Injector, private appRef: ApplicationRef) {}

  confirm(message: string): Promise<boolean> {
    const env = this.injector.get(EnvironmentInjector) as EnvironmentInjector;
    const compRef = createComponent(ConfirmDialogComponent, {
      environmentInjector: env,
      elementInjector: this.injector,
    });
    compRef.instance.message = message;

    // attach to app and DOM
    this.appRef.attachView(compRef.hostView);
    const hostView: any = compRef.hostView;
    const nodes: any[] = hostView.rootNodes ?? [];
    nodes.forEach((n) => document.body.appendChild(n));

    return new Promise<boolean>((resolve) => {
      const sub = compRef.instance.closed.subscribe((result: boolean) => {
        resolve(result);
        sub.unsubscribe();
        try {
          this.appRef.detachView(compRef.hostView);
        } catch {}
        compRef.destroy();
        nodes.forEach((n) => {
          if (n.parentNode) n.parentNode.removeChild(n);
        });
      });
    });
  }
}
