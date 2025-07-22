import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { Perfil } from '../models/perfil.model';
import { UsuarioPerfil } from '../models/usuario-perfil.model';
import { SequelizeConfigService, UserContext } from '../sequelize.config';
import { PerfilDto } from '../../perfil/dto/perfil.dto';

@Injectable()
export class PerfilRepository extends BaseRepository<Perfil> {
  constructor(sequelizeConfig: SequelizeConfigService) {
    super(Perfil, sequelizeConfig);
  }

  /**
   * CRUD básico con Sequelize
   */
  async createPerfil(
    data: {
      idaplicacion: string;
      descripcion: string;
    },
    context: UserContext,
  ): Promise<Perfil> {
    this.logger.log(`Creando perfil: ${data.descripcion}`);
    
    return this.withUserContext(context, async () => {
      return Perfil.create({
        ...data,
        // Triggers automáticos manejan auditoría
      } as any);
    });
  }

  async updatePerfil(
    id: string,
    descripcion: string,
    context: UserContext,
  ): Promise<Perfil | null> {
    this.logger.log(`Actualizando perfil: ${id}`);
    
    return this.withUserContext(context, async () => {
      const [affectedCount, updatedRows] = await Perfil.update(
        { descripcion } as any,
        {
          where: { idperfil: id, estado: true },
          returning: true,
        },
      );

      return affectedCount > 0 ? updatedRows[0] : null;
    });
  }

  async deletePerfil(id: string, context: UserContext): Promise<boolean> {
    this.logger.log(`Eliminando perfil: ${id}`);
    
    return this.withUserContext(context, async () => {
      const deletedCount = await Perfil.destroy({
        where: { idperfil: id },
      });

      return deletedCount > 0;
    });
  }

  /**
   * Obtener perfiles por aplicación (aprovecha RLS)
   */
  async findPerfilesByApplication(
    idaplicacion: string,
    context: UserContext,
  ): Promise<PerfilDto[]> {
    this.logger.log(`Obteniendo perfiles para aplicación: ${idaplicacion}`);
    
    return this.withUserContext(context, async () => {
      const perfiles = await Perfil.findByApplication(idaplicacion);
      
      return perfiles.map(perfil => ({
        idperfil: perfil.idperfil,
        idaplicacion: perfil.idaplicacion,
        descripcion: perfil.descripcion,
        fechacreacion: perfil.fechacreacion.toISOString(),
        usuariocreacion: perfil.usuariocreacion,
        fechaactualizacion: perfil.fechaactualizacion?.toISOString(),
        usuarioactualizacion: perfil.usuarioactualizacion,
        estado: perfil.estado,
      }));
    });
  }

  /**
   * Asignar perfil a usuario
   */
  async asignarPerfilUsuario(
    data: {
      user_id: string;
      idperfil: string;
    },
    context: UserContext,
  ): Promise<UsuarioPerfil> {
    this.logger.log(`Asignando perfil ${data.idperfil} a usuario ${data.user_id}`);
    
    return this.withUserContext(context, async () => {
      // Verificar si ya existe la asignación
      const existente = await UsuarioPerfil.findOne({
        where: {
          user_id: data.user_id,
          idperfil: data.idperfil,
        },
      });

      if (existente) {
        throw new Error('El usuario ya tiene asignado este perfil');
      }

      return UsuarioPerfil.create({
        ...data,
        // Triggers automáticos manejan auditoría
      } as any);
    });
  }

  /**
   * Remover perfil de usuario
   */
  async removerPerfilUsuario(
    userId: string,
    idperfil: string,
    context: UserContext,
  ): Promise<boolean> {
    this.logger.log(`Removiendo perfil ${idperfil} de usuario ${userId}`);
    
    return this.withUserContext(context, async () => {
      const deletedCount = await UsuarioPerfil.destroy({
        where: {
          user_id: userId,
          idperfil: idperfil,
        },
      });

      return deletedCount > 0;
    });
  }

  /**
   * Obtener perfiles de un usuario
   */
  async findPerfilesByUser(
    userId: string,
    context: UserContext,
  ): Promise<PerfilDto[]> {
    this.logger.log(`Obteniendo perfiles del usuario: ${userId}`);
    
    return this.withUserContext(context, async () => {
      const usuarioPerfiles = await UsuarioPerfil.findByUser(userId);
      
      return usuarioPerfiles.map(up => ({
        idperfil: up.perfil.idperfil,
        idaplicacion: up.perfil.idaplicacion,
        descripcion: up.perfil.descripcion,
        fechacreacion: up.perfil.fechacreacion.toISOString(),
        usuariocreacion: up.perfil.usuariocreacion,
        fechaactualizacion: up.perfil.fechaactualizacion?.toISOString(),
        usuarioactualizacion: up.perfil.usuarioactualizacion,
        estado: up.perfil.estado,
      }));
    });
  }

  /**
   * Obtener todos los perfiles (solo admins)
   */
  async findAllPerfiles(context: UserContext): Promise<PerfilDto[]> {
    this.logger.log('Obteniendo todos los perfiles (admin)');
    
    return this.withUserContext(context, async () => {
      const perfiles = await Perfil.findAll({
        include: [
          {
            model: require('../models/aplicacion.model').Aplicacion,
            as: 'aplicacion',
            attributes: ['descripcion'],
          },
        ],
        order: [['descripcion', 'ASC']],
      });

      return perfiles.map(perfil => ({
        idperfil: perfil.idperfil,
        idaplicacion: perfil.idaplicacion,
        descripcion: perfil.descripcion,
        fechacreacion: perfil.fechacreacion.toISOString(),
        usuariocreacion: perfil.usuariocreacion,
        fechaactualizacion: perfil.fechaactualizacion?.toISOString(),
        usuarioactualizacion: perfil.usuarioactualizacion,
        estado: perfil.estado,
      }));
    });
  }
}