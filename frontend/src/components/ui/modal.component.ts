import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ title }}</h2>
            <button mat-icon-button (click)="close()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <div class="modal-content">
            <ng-content></ng-content>
          </div>
          
          @if (showFooter) {
            <div class="modal-footer">
              <ng-content select="[slot=footer]"></ng-content>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-container {
      background: white;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }
    
    .modal-content {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }
    
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() showFooter = true;
  @Output() closeModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }
}