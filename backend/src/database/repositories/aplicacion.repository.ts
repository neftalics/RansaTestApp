import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Aplicacion } from '../models/aplicacion.model';
import { SequelizeConfigService, UserContext } from '../sequelize.config';
import { AplicacionDto } from '../../aplicacion/dto/aplicacion.dto';

@Injectable()
export class AplicacionRepository extends BaseRepository<Aplicacion> {
  constructor(sequelizeConfig: SequelizeConfigService) {
    super(Aplicacion, sequelizeConfig);
  }

  /**
   * CRUD básico con Sequelize - aprovecha triggers automáticos
   */
  async createAplicacion(
    descripcion: string,
    context: UserContext,
  ): Promise<Aplicacion> {
    this.logger.log(`Creando aplicación: ${descripcion}`);
    
    return this.withUserContext(context, async () => {
      return Aplicacion.create({
        descripcion,
        // Los triggers fn_aud() manejan automáticamente:
        // - fechacreacion
        // - usuariocreacion
        // - estado = true
      } as any);
    });
  }

  async updateAplicacion(
    id: string,
    descripcion: string,
    context: UserContext,
  ): Promise<Aplicacion | null> {
    this.logger.log(`Actualizando aplicación: ${id}`);
    
    return this.withUserContext(context, async () => {
      const [affectedCount, updatedRows] = await Aplicacion.update(
        { descripcion } as any,
        {
          where: { idaplicacion: id, estado: true },
          returning: true,
        },
      );

      return affectedCount > 0 ? updatedRows[0] : null;
    });
  }

  async deleteAplicacion(id: string, context: UserContext): Promise<boolean> {
    this.logger.log(`Eliminando aplicación: ${id}`);
    
    return this.withUserContext(context, async () => {
      // El trigger fn_borrar_logico() maneja automáticamente:
      // - estado = false
      // - fechaactualizacion = now()
      // - usuarioactualizacion
      const deletedCount = await Aplicacion.destroy({
        where: { idaplicacion: id },
      });

      return deletedCount > 0;
    });
  }

  /**
   * Operaciones complejas - usa las funciones RPC de Supabase
   */
  async findAplicacionesUsuario(context: UserContext): Promise<AplicacionDto[]> {
    this.logger.log('Obteniendo aplicaciones del usuario via RLS');
    
    // Aprovecha las políticas RLS existentes
    return this.withUserContext(context, async () => {
      const aplicaciones = await Aplicacion.findAll({
        where: { estado: true },
        attributes: [
          'idaplicacion',
          'descripcion',
          'fechacreacion',
          'usuariocreacion',
          'fechaactualizacion',
          'usuarioactualizacion',
          'estado',
        ],
        order: [['descripcion', 'ASC']],
      });

      console.log('APLICACIONES RAW:', aplicaciones);

      return aplicaciones.map(app => ({
        idaplicacion: app.dataValues.idaplicacion,
        descripcion: app.dataValues.descripcion,
        fechacreacion: app.dataValues.fechacreacion ? app.dataValues.fechacreacion.toISOString() : null,
        usuariocreacion: app.dataValues.usuariocreacion,
        fechaactualizacion: app.dataValues.fechaactualizacion ? app.dataValues.fechaactualizacion.toISOString() : null,
        usuarioactualizacion: app.dataValues.usuarioactualizacion,
        estado: app.dataValues.estado,
      }));
    });
  }

  /**
   * Verificar acceso usando la función RPC existente
   */
  async verificarAccesoApp(
    appId: string,
    context: UserContext,
  ): Promise<boolean> {
    this.logger.log(`Verificando acceso a aplicación: ${appId}`);
    
    try {
      const result = await this.executeRawQuery<boolean>(
        'SELECT public.fn_acceso_app(:app_id) as tiene_acceso',
        { app_id: appId },
        context,
      );

      return (result as any)?.tiene_acceso || false;
    } catch (error) {
      this.logger.error(`Error verificando acceso a app ${appId}:`, error);
      return false;
    }
  }

  /**
   * Obtener todas las aplicaciones (solo admins)
   */
  async findAllAplicaciones(context: UserContext): Promise<AplicacionDto[]> {
    this.logger.log('Obteniendo todas las aplicaciones (admin)');
    
    return this.withUserContext(context, async () => {
      const aplicaciones = await Aplicacion.findAll({
        attributes: [
          'idaplicacion',
          'descripcion',
          'fechacreacion',
          'usuariocreacion',
          'fechaactualizacion',
          'usuarioactualizacion',
          'estado',
        ],
        order: [['descripcion', 'ASC']],
      });

      return aplicaciones.map(app => ({
        idaplicacion: app.dataValues.idaplicacion,
        descripcion: app.dataValues.descripcion,
        fechacreacion: app.dataValues.fechacreacion ? app.dataValues.fechacreacion.toISOString() : null,
        usuariocreacion: app.dataValues.usuariocreacion,
        fechaactualizacion: app.dataValues.fechaactualizacion ? app.dataValues.fechaactualizacion.toISOString() : null,
        usuarioactualizacion: app.dataValues.usuarioactualizacion,
        estado: app.dataValues.estado,
      }));
    });
  }
}