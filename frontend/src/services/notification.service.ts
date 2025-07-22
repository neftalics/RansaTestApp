// src/services/notification.service.ts
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  private open(message: string, config: MatSnackBarConfig): void {
    this.snackBar.open(message, 'Cerrar', config);
  }

  showSuccess(message: string, duration = 3000): void {
    this.open(message, {
      duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showError(message: string, duration = 5000): void {
    this.open(message, {
      duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showWarning(message: string, duration = 4000): void {
    this.open(message, {
      duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showInfo(message: string, duration = 3000): void {
    this.open(message, {
      duration,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
