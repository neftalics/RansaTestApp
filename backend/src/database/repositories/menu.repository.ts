import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Menu } from '../models/menu.model';
import { SequelizeConfigService, UserContext } from '../sequelize.config';
import { MenuItemDto } from '../../menu/dto/menu.dto';

@Injectable()
export class MenuRepository extends BaseRepository<Menu> {
  constructor(sequelizeConfig: SequelizeConfigService) {
    super(Menu, sequelizeConfig);
  }

  /**
   * CRUD básico con Sequelize
   */
  async createMenu(
    data: {
      idaplicacion: string;
      descripcion: string;
      menupadre?: string;
      icono?: string;
      path?: string;
    },
    context: UserContext,
  ): Promise<Menu> {
    this.logger.log(`Creando menú: ${data.descripcion}`);
    
    return this.withUserContext(context, async () => {
      return Menu.create({
        ...data,
        // Triggers automáticos manejan auditoría
      } as any);
    });
  }

  async updateMenu(
    id: string,
    data: {
      descripcion?: string;
      menupadre?: string;
      icono?: string;
      path?: string;
    },
    context: UserContext,
  ): Promise<Menu | null> {
    this.logger.log(`Actualizando menú: ${id}`);
    
    return this.withUserContext(context, async () => {
      const [affectedCount, updatedRows] = await Menu.update(
        data as any,
        {
          where: { idmenu: id, estado: true },
          returning: true,
        },
      );

      return affectedCount > 0 ? updatedRows[0] : null;
    });
  }

  async deleteMenu(id: string, context: UserContext): Promise<boolean> {
    this.logger.log(`Eliminando menú: ${id}`);
    
    return this.withUserContext(context, async () => {
      const deletedCount = await Menu.destroy({
        where: { idmenu: id },
      });

      return deletedCount > 0;
    });
  }

  /**
   * Operación compleja - usa la función RPC de Supabase
   */
  async findMenuUsuario(
    appId: string,
    context: UserContext,
  ): Promise<MenuItemDto[]> {
    this.logger.log(`Obteniendo menú autorizado para app: ${appId}`);
    
    try {
      // Usa tu función RPC fn_menu_usuario existente
      const menus = await this.executeRawQuery<MenuItemDto[]>(
        'SELECT * FROM public.fn_menu_usuario(:app_id)',
        { app_id: appId },
        context,
      );

      return (menus as any[]).map(menu => ({
        idmenu: menu.idmenu,
        descripcion: menu.descripcion,
        menupadre: menu.menupadre,
        icono: menu.icono,
        path: menu.path,
      }));
    } catch (error) {
      this.logger.error(`Error obteniendo menú usuario para app ${appId}:`, error);
      return [];
    }
  }

  /**
   * Verificar si es admin usando función RPC
   */
  async verificarEsAdmin(context: UserContext): Promise<boolean> {
    try {
      const result = await this.executeRawQuery<boolean>(
        'SELECT public.fn_es_admin() as es_admin',
        {},
        context,
      );

      return (result as any)?.es_admin || false;
    } catch (error) {
      this.logger.error('Error verificando si es admin:', error);
      return false;
    }
  }

  /**
   * Obtener menús por aplicación (con Sequelize + relaciones)
   */
  async findMenusByApplication(
    idaplicacion: string,
    context: UserContext,
  ): Promise<MenuItemDto[]> {
    this.logger.log(`Obteniendo menús por aplicación: ${idaplicacion}`);
    
    return this.withUserContext(context, async () => {
      const menus = await Menu.findByApplication(idaplicacion);
      
      return menus.map(menu => ({
        idmenu: menu.idmenu,
        descripcion: menu.descripcion,
        menupadre: menu.menupadre,
        icono: menu.icono,
        path: menu.path,
      }));
    });
  }

  /**
   * Obtener jerarquía de menús (aprovecha relaciones Sequelize)
   */
  async findMenuHierarchy(
    idaplicacion: string,
    context: UserContext,
  ): Promise<MenuItemDto[]> {
    this.logger.log(`Obteniendo jerarquía de menús para app: ${idaplicacion}`);
    
    return this.withUserContext(context, async () => {
      const rootMenus = await Menu.findRootMenus(idaplicacion);
      
      return this.buildMenuHierarchy(rootMenus);
    });
  }

  /**
   * Construye la jerarquía de menús recursivamente
   */
  private buildMenuHierarchy(menus: Menu[]): MenuItemDto[] {
    return menus.map(menu => ({
      idmenu: menu.idmenu,
      descripcion: menu.descripcion,
      menupadre: menu.menupadre,
      icono: menu.icono,
      path: menu.path,
      // Si tiene submenús, los incluye recursivamente
      ...(menu.subMenus && menu.subMenus.length > 0 && {
        subMenus: this.buildMenuHierarchy(menu.subMenus),
      }),
    }));
  }

  /**
   * Obtener todos los menús (solo admins)
   */
  async findAllMenus(context: UserContext): Promise<MenuItemDto[]> {
    this.logger.log('Obteniendo todos los menús (admin)');
    
    return this.withUserContext(context, async () => {
      const menus = await Menu.findAll({
        where: { estado: true },
        order: [['descripcion', 'ASC']],
      });

      return menus.map(menu => ({
        idmenu: menu.idmenu,
        descripcion: menu.descripcion,
        menupadre: menu.menupadre,
        icono: menu.icono,
        path: menu.path,
      }));
    });
  }
}