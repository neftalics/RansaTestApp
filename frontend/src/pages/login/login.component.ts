import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
// Importa el LoadingSpinnerComponent si lo usas en tu proyecto
// import { LoadingSpinnerComponent } from '../components/ui/loading-spinner.component';
// Importa environment desde la ruta correcta
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    // LoadingSpinnerComponent, // solo si realmente lo usas
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-header">
            <mat-icon class="login-icon">lock</mat-icon>
            <mat-card-title>Iniciar Sesión</mat-card-title>
            <mat-card-subtitle>Accede a tu cuenta del sistema</mat-card-subtitle>
          </div>
        </mat-card-header>

        <mat-card-content>
          @if (error()) {
            <div class="error-message">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="login-form" autocomplete="off">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo Electrónico</mat-label>
              <input matInput
                     type="email"
                     [(ngModel)]="credentials.email"
                     name="email"
                     required
                     autocomplete="username">
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contraseña</mat-label>
              <input matInput
                     [type]="showPassword() ? 'text' : 'password'"
                     [(ngModel)]="credentials.password"
                     name="password"
                     required
                     autocomplete="current-password">
              <button mat-icon-button
                      matSuffix
                      type="button"
                      (click)="togglePasswordVisibility()">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <button mat-raised-button
                    color="primary"
                    type="submit"
                    class="full-width login-button"
                    [disabled]="isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                Iniciando sesión...
              } @else {
                Iniciar Sesión
              }
            </button>
          </form>

          <div class="api-info">
            <p class="info-text">
              <mat-icon>info</mat-icon>
              Conectando con API en: <code>{{ apiUrl }}</code>
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      padding: 16px;
    }

    .login-card {
      max-width: 400px;
      width: 100%;
    }

    .login-header {
      text-align: center;
      width: 100%;
    }

    .login-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #4caf50;
      margin-bottom: 16px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
    }

    .full-width {
      width: 100%;
    }

    .login-button {
      height: 48px;
      font-size: 1rem;
      margin-top: 8px;
    }

    .button-spinner {
      margin-right: 8px;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      border-left: 4px solid #c62828;
    }

    .api-info {
      margin-top: 24px;
      text-align: center;
    }

    .info-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.875rem;
      color: #666;
    }

    .info-text code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }
  `,
  ],
})
export class LoginComponent {
  apiUrl = environment.apiUrl;

  credentials: { email: string; password: string } = {
    email: '',
    password: '',
  };

  isLoading = signal(false);
  error = signal('');
  showPassword = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword.update((show) => !show);
  }
  
  async onSubmit(): Promise<void> {
    if (!this.credentials.email || !this.credentials.password) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    // login() devuelve Promise<{ error }>
    const { error } = await this.authService.login(
      this.credentials.email,
      this.credentials.password
    );
    this.isLoading.set(false);

    if (error) {
      this.error.set(error.message || 'Error al conectar con el servidor');
    } else {
      await this.router.navigate(['/dashboard']);
    }
  }
}