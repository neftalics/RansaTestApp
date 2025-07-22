import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MenuService } from './menu.service';

@Controller('menu')
@UseGuards(JwtAuthGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * GET /menu/usuario?app_id=uuid
   * Obtiene el menú autorizado para el usuario actual
   */
  @Get('usuario')
  async obtenerMenuUsuario(
    @Query('app_id') appId: string,
    @Request() req: any
  ) {
    if (!appId) {
      throw new BadRequestException('Parámetro app_id requerido');
    }

    const token = this.extractToken(req);
    return this.menuService.obtenerMenuUsuario(appId, token);
  }

  /**
   * GET /menu/verificar-acceso?app_id=uuid
   * Verifica si el usuario tiene acceso a una aplicación
   */
  @Get('verificar-acceso')
  async verificarAccesoApp(
    @Query('app_id') appId: string,
    @Request() req: any
  ) {
    if (!appId) {
      throw new BadRequestException('Parámetro app_id requerido');
    }

    const token = this.extractToken(req);
    return this.menuService.verificarAccesoApp(appId, token);
  }

  /**
   * GET /menu/admin/todos
   * Obtiene todos los menús (solo para administradores)
   */
  @Get('admin/todos')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async obtenerTodosLosMenus(@Request() req: any) {
    const token = this.extractToken(req);
    const menus = await this.menuService.obtenerTodosLosMenus(token);
    
    return {
      success: true,
      data: menus,
      message: 'Menús obtenidos exitosamente'
    };
  }

  /**
   * GET /menu/es-admin
   * Verifica si el usuario actual es administrador
   */
  @Get('es-admin')
  async verificarEsAdmin(@Request() req: any) {
    const token = this.extractToken(req);
    const esAdmin = await this.menuService.verificarEsAdmin(token);
    
    return {
      success: true,
      esAdmin,
      message: esAdmin ? 'Usuario es administrador' : 'Usuario no es administrador'
    };
  }

  private extractToken(req: any): string {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new BadRequestException('Token de autorización requerido');
    }
    return token;
  }
}