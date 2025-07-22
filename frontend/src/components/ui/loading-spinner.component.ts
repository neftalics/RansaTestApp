import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container" [class]="containerClass">
      <mat-spinner [diameter]="spinnerSize"></mat-spinner>
      @if (message) {
        <p class="loading-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    
    .loading-message {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() message?: string;
  @Input() containerClass?: string;

  get spinnerSize(): number {
    const sizes = {
      sm: 24,
      md: 40,
      lg: 60
    };
    return sizes[this.size];
  }
}