import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'aplicaciones',
    loadComponent: () => import('./pages/aplicaciones/aplicaciones.component').then(m => m.AplicacionesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: 'aplicaciones',
        loadComponent: () => import('./pages/aplicaciones/aplicaciones.component').then(m => m.AplicacionesComponent)
      },
      {
        path: 'health',
        loadComponent: () => import('./pages/admin/health.component').then(m => m.HealthComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];