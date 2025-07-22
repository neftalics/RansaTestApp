import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth.service';
import { MenuUsuario } from '../../../types/menu.types';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']   // asegúrate de crear este css
})
export class SidebarComponent implements OnChanges {
  @Input() menuItems: MenuUsuario[] | null = [];

  constructor(private authService: AuthService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['menuItems']) {
      this.menuItems = Array.isArray(this.menuItems) ? this.menuItems : [];
    }
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  trackById = (_: number, item: MenuUsuario) => item.id;

  getIcon(iconName?: string): string {
    const iconMap: Record<string, string> = {
      home: 'home',
      users: 'people',
      'bar-chart': 'bar_chart',
      settings: 'settings',
      database: 'storage',
      shield: 'security',
      menu: 'menu'
    };
    return iconMap[iconName || 'menu'] || 'menu';
  }
}
