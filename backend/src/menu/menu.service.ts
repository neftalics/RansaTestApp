import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseRpcService } from '../common/base-rpc.service';
import { SupabaseRpcHelper } from '../common/supabase-rpc.helper';
import { MenuItemDto, MenuUsuarioResponseDto, AccesoAppResponseDto } from './dto/menu.dto';

@Injectable()
export class MenuService extends BaseRpcService {
  constructor(
    configService: ConfigService,
    private readonly rpcHelper: SupabaseRpcHelper
  ) {
    super(configService);
  }

  /**
   * Obtiene el menú autorizado para el usuario actual según la aplicación
   * Invoca fn_menu_usuario(app_id) en Supabase
   */
  async obtenerMenuUsuario(
    appId: string,
    userToken: string
  ): Promise<MenuUsuarioResponseDto> {
    if (!appId) {
      throw new BadRequestException('ID de aplicación requerido');
    }

    const result = await this.rpcHelper.executeRpc<MenuItemDto[]>(
      'fn_menu_usuario',
      { app_id: appId },
      userToken
    );

    if (!result.success) {
      return {
        success: false,
        data: [],
        message: result.message || 'Error obteniendo menú del usuario'
      };
    }

    // Organizar menú jerárquicamente (lógica adicional en NestJS)
    const menuOrganizado = this.organizarMenuJerarquico(result.data);

    return {
      success: true,
      data: menuOrganizado,
      message: `Menú obtenido exitosamente para la aplicación ${appId}`
    };
  }

  /**
   * Verifica si el usuario tiene acceso a una aplicación específica
   * Invoca fn_acceso_app(id_app) en Supabase
   */
  async verificarAccesoApp(
    appId: string,
    userToken: string
  ): Promise<AccesoAppResponseDto> {
    if (!appId) {
      throw new BadRequestException('ID de aplicación requerido');
    }

    const tieneAcceso = await this.rpcHelper.executeRpcBoolean(
      'fn_acceso_app',
      { id_app: appId },
      userToken
    );

    return {
      success: true,
      tieneAcceso,
      message: tieneAcceso 
        ? 'Usuario tiene acceso a la aplicación' 
        : 'Usuario no tiene acceso a la aplicación'
    };
  }

  /**
   * Verifica si el usuario actual es administrador
   * Invoca fn_es_admin() en Supabase
   */
  async verificarEsAdmin(userToken: string): Promise<boolean> {
    return this.rpcHelper.executeRpcBoolean('fn_es_admin', {}, userToken);
  }

  /**
   * Obtiene todos los menús (solo para administradores)
   */
  async obtenerTodosLosMenus(userToken: string): Promise<MenuItemDto[]> {
    try {
      this.logger.log('Obteniendo todos los menús (admin)');

      const { data, error } = await this.supabase
        .from('menu')
        .select('idmenu, descripcion, menupadre, icono, path')
        .eq('estado', true)
        .order('descripcion');

      if (error) {
        throw new Error(`Error obteniendo menús: ${error.message}`);
      }

      return data as MenuItemDto[];
    } catch (error) {
      this.logger.error('Error obteniendo todos los menús:', error);
      return [];
    }
  }

  /**
   * Organiza los elementos del menú de forma jerárquica
   * (Lógica adicional en NestJS sin duplicar la de Supabase)
   */
  private organizarMenuJerarquico(menuItems: MenuItemDto[]): MenuItemDto[] {
    const menuMap = new Map<string, MenuItemDto & { children?: MenuItemDto[] }>();
    const menuRaiz: (MenuItemDto & { children?: MenuItemDto[] })[] = [];

    // Crear mapa de todos los elementos
    menuItems.forEach(item => {
      menuMap.set(item.idmenu, { ...item, children: [] });
    });

    // Organizar jerárquicamente
    menuItems.forEach(item => {
      const menuItem = menuMap.get(item.idmenu);
      
      if (item.menupadre && menuMap.has(item.menupadre)) {
        // Es un submenu
        const padre = menuMap.get(item.menupadre);
        padre.children.push(menuItem);
      } else {
        // Es un menu raíz
        menuRaiz.push(menuItem);
      }
    });

    return menuRaiz;
  }
}