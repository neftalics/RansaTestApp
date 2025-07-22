import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { filter } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { MenuService } from './services/menu.service';
import { NavbarComponent } from './components/layout/navbar.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { LoadingSpinnerComponent } from './components/ui/loading-spinner.component';
import { MenuUsuario } from './types/menu.types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    HttpClientModule,
    NavbarComponent, 
    SidebarComponent, 
    LoadingSpinnerComponent
  ],
  template: `
    @if (authService.isLoading) {
      <div class="loading-screen">
        <app-loading-spinner 
          size="lg" 
          message="Cargando aplicación..." 
          containerClass="loading-container">
        </app-loading-spinner>
      </div>
    } @else {
      @if (authService.isAuthenticated && !isLoginPage()) {
        <!-- Layout con sidebar -->
        <app-sidebar [menuItems]="menuItems()">
          <div class="main-layout">
            <app-navbar></app-navbar>
            <main class="main-content">
              <router-outlet></router-outlet>
            </main>
          </div>
        </app-sidebar>
      } @else {
        <!-- Layout sin sidebar (login) -->
        <router-outlet></router-outlet>
      }
    }
  `,
  styles: [`
    .loading-screen {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .main-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .main-content {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class AppComponent implements OnInit {
  menuItems = signal<MenuUsuario[]>([]);
  currentRoute = signal('');

  constructor(
    public authService: AuthService,
    private menuService: MenuService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Escuchar cambios de ruta y recargar menú si es necesario
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.urlAfterRedirects || event.url);
        this.loadMenuIfNeeded();
      });
  }

  private loadMenuIfNeeded(): void {
    if (this.authService.isAuthenticated && !this.isLoginPage()) {
      // TODO: Obtener app_id real (aquí puedes personalizar)
      const defaultAppId = "1"; // String, ajusta a tu lógica real
      this.menuService.getForUser(defaultAppId).subscribe({
        next: (menus) => this.menuItems.set(menus || []),
        error: (error) => {
          console.error('Error cargando menú del usuario:', error);
          this.menuItems.set([]);
        }
      });
    } else {
      this.menuItems.set([]);
    }
  }

  isLoginPage(): boolean {
    return this.currentRoute().includes('/login');
  }
}
