import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule, 
    MatMenuModule,
    MatChipsModule
  ],
  template: `
    <mat-toolbar>
      <span class="toolbar-title">Sistema Admin</span>
      
      <span class="toolbar-spacer"></span>
      
      @if (user()) {
        <div class="user-info">
          <mat-chip-set>
            <mat-chip [color]="user()?.role === 'admin' ? 'primary' : 'accent'">
              <mat-icon matChipAvatar>person</mat-icon>
              {{ user()?.name || user()?.email }}
            </mat-chip>
          </mat-chip-set>
          
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar Sesión</span>
            </button>
          </mat-menu>
        </div>
      }
    </mat-toolbar>
  `,
  styles: [`
    .toolbar-spacer {
      flex: 1 1 auto;
    }
    
    .toolbar-title {
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class NavbarComponent {
  user = computed(() => this.authService.currentUser);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
  }
}