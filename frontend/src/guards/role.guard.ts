import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'] as string;
    const userRole = this.authService.currentUser?.role;

    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }

    if (requiredRole && userRole !== requiredRole) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}