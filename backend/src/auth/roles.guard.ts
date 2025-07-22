import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Debug: muestra los roles requeridos y el usuario
    console.log('ROLES requeridos:', requiredRoles);
    console.log('Usuario JWT:', user);

    // Extrae el rol desde el JWT principal y desde los metadatos
    const userRole = user.role || (user.raw_user_meta_data && user.raw_user_meta_data.role);

    console.log('Rol detectado:', userRole);

    const hasRole = requiredRoles.some((role) => userRole === role);

    if (!hasRole) {
      console.log('Acceso denegado: el usuario no tiene el rol requerido');
      throw new ForbiddenException('No tiene permisos suficientes');
    }

    return true;
  }
}