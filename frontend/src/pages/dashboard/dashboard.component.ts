import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../services/auth.service';
import { AplicacionService } from '../../services/aplicacion.service';
import { MenuService } from '../../services/menu.service';
import { Aplicacion } from '../../types/aplicacion.types';
import { MenuUsuario } from '../../types/menu.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatGridListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  aplicaciones = signal<Aplicacion[]>([]);
  menus        = signal<MenuUsuario[]>([]);
  isLoading    = signal(true);

  user = computed(() => this.authService.currentUser);

  constructor(
    private authService: AuthService,
    private aplicacionService: AplicacionService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    this.aplicacionService.getByUsuario().subscribe({
      next: apps => {
        this.aplicaciones.set(apps ?? []);
        if (apps && apps.length) {
          this.menuService.getForUser(apps[0].id.toString()).subscribe({
            next: m => { this.menus.set(m ?? []); this.isLoading.set(false); },
            error: e => { console.error(e); this.isLoading.set(false); }
          });
        } else {
          this.isLoading.set(false);
        }
      },
      error: err => { console.error(err); this.isLoading.set(false); }
    });
  }

  getMenuIcon(iconName?: string): string {
    const map: Record<string, string> = {
      home: 'home',
      users: 'people',
      'bar-chart': 'bar_chart',
      settings: 'settings'
    };
    return map[iconName || 'menu'] || 'menu';
  }

  trackByApp  = (_: number, app: Aplicacion)   => app.id;
  trackByMenu = (_: number, menu: MenuUsuario) => menu.id;

  
  aplicacionesList = computed<Aplicacion[]>(() =>
    Array.isArray(this.aplicaciones()) ? this.aplicaciones() : Object.values(this.aplicaciones() ?? {})
  );

  menusList = computed<MenuUsuario[]>(() =>
    Array.isArray(this.menus()) ? this.menus() : Object.values(this.menus() ?? {})
  );
}

