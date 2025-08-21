import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SnackbarItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private subject = new BehaviorSubject<SnackbarItem[]>([]);
  public messages$ = this.subject.asObservable();

  show(
    message: string,
    opts?: { type?: 'success' | 'error' | 'info'; duration?: number }
  ) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const item: SnackbarItem = {
      id,
      message,
      type: opts?.type ?? 'info',
      duration: opts?.duration ?? 4000,
    };

    const list = [...this.subject.getValue(), item];
    this.subject.next(list);

    if (item.duration && item.duration > 0) {
      setTimeout(() => this.dismiss(id), item.duration);
    }

    return id;
  }

  dismiss(id: string) {
    this.subject.next(this.subject.getValue().filter((m) => m.id !== id));
  }

  clear() {
    this.subject.next([]);
  }
}
