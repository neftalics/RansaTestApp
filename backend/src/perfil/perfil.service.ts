import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseRpcService } from '../common/base-rpc.service';
import { 
  PerfilDto, 
  PerfilResponseDto, 
  CreatePerfilDto, 
  UpdatePerfilDto,
  AsignarPerfilUsuarioDto 
} from './dto/perfil.dto';

@Injectable()
export class PerfilService extends BaseRpcService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  /**
   * Obtiene los perfiles de una aplicación específica
   * Usa RLS para filtrar según permisos del usuario
   */
  async obtenerPerfilesPorAplicacion(
    idAplicacion: string,
    userToken: string
  ): Promise<PerfilResponseDto> {
    try {
      if (!idAplicacion) {
        throw new BadRequestException('ID de aplicación requerido');
      }

      this.logger.log(`Obteniendo perfiles para aplicación: ${idAplicacion}`);

      const userClient = this.createUserClient(userToken);

      const { data, error } = await userClient
        .from('perfil')
        .select('*')
        .eq('idaplicacion', idAplicacion)
        .eq('estado', true)
        .order('descripcion');

      if (error) {
        throw new Error(`Error obteniendo perfiles: ${error.message}`);
      }

      return {
        success: true,
        data: data as PerfilDto[],
        message: 'Perfiles obtenidos exitosamente'
      };
    } catch (error) {
      this.logger.error(`Error obteniendo perfiles para app ${idAplicacion}:`, error);
      
      return {
        success: false,
        data: [],
        message: error.message || 'Error obteniendo perfiles'
      };
    }
  }

  /**
   * Crea un nuevo perfil (solo admins)
   */
  async crearPerfil(
    createPerfilDto: CreatePerfilDto,
    userToken: string
  ): Promise<PerfilDto> {
    try {
      if (!createPerfilDto.descripcion?.trim() || !createPerfilDto.idaplicacion) {
        throw new BadRequestException('Descripción e ID de aplicación requeridos');
      }

      this.logger.log(`Creando perfil: ${createPerfilDto.descripcion}`);

      const { data, error } = await this.supabase
        .from('perfil')
        .insert({
          idaplicacion: createPerfilDto.idaplicacion,
          descripcion: createPerfilDto.descripcion.trim()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creando perfil: ${error.message}`);
      }

      this.logger.log(`Perfil creado exitosamente: ${data.idperfil}`);
      return data as PerfilDto;
    } catch (error) {
      this.logger.error('Error creando perfil:', error);
      throw error;
    }
  }

  /**
   * Actualiza un perfil existente (solo admins)
   */
  async actualizarPerfil(
    id: string,
    updatePerfilDto: UpdatePerfilDto,
    userToken: string
  ): Promise<PerfilDto> {
    try {
      if (!id) {
        throw new BadRequestException('ID de perfil requerido');
      }

      this.logger.log(`Actualizando perfil: ${id}`);

      const updateData: any = {};
      if (updatePerfilDto.descripcion?.trim()) {
        updateData.descripcion = updatePerfilDto.descripcion.trim();
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException('No hay datos para actualizar');
      }

      const { data, error } = await this.supabase
        .from('perfil')
        .update(updateData)
        .eq('idperfil', id)
        .eq('estado', true)
        .select()
        .single();

      if (error) {
        throw new Error(`Error actualizando perfil: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundException('Perfil no encontrado');
      }

      this.logger.log(`Perfil actualizado exitosamente: ${id}`);
      return data as PerfilDto;
    } catch (error) {
      this.logger.error(`Error actualizando perfil ${id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un perfil (borrado lógico via trigger)
   */
  async eliminarPerfil(id: string, userToken: string): Promise<void> {
    try {
      if (!id) {
        throw new BadRequestException('ID de perfil requerido');
      }

      this.logger.log(`Eliminando perfil: ${id}`);

      const { error } = await this.supabase
        .from('perfil')
        .delete()
        .eq('idperfil', id);

      if (error) {
        throw new Error(`Error eliminando perfil: ${error.message}`);
      }

      this.logger.log(`Perfil eliminado exitosamente: ${id}`);
    } catch (error) {
      this.logger.error(`Error eliminando perfil ${id}:`, error);
      throw error;
    }
  }

  /**
   * Asigna un perfil a un usuario
   */
  async asignarPerfilUsuario(
    asignarDto: AsignarPerfilUsuarioDto,
    userToken: string
  ): Promise<void> {
    try {
      if (!asignarDto.user_id || !asignarDto.idperfil) {
        throw new BadRequestException('ID de usuario e ID de perfil requeridos');
      }

      this.logger.log(`Asignando perfil ${asignarDto.idperfil} a usuario ${asignarDto.user_id}`);

      // Verificar si ya existe la asignación
      const { data: existente } = await this.supabase
        .from('usuario_perfil')
        .select('id')
        .eq('user_id', asignarDto.user_id)
        .eq('idperfil', asignarDto.idperfil)
        .single();

      if (existente) {
        throw new BadRequestException('El usuario ya tiene asignado este perfil');
      }

      const { error } = await this.supabase
        .from('usuario_perfil')
        .insert({
          user_id: asignarDto.user_id,
          idperfil: asignarDto.idperfil
        });

      if (error) {
        throw new Error(`Error asignando perfil: ${error.message}`);
      }

      this.logger.log(`Perfil asignado exitosamente`);
    } catch (error) {
      this.logger.error('Error asignando perfil a usuario:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los perfiles (solo para administradores)
   */
  async obtenerTodosLosPerfiles(): Promise<PerfilDto[]> {
    try {
      this.logger.log('Obteniendo todos los perfiles (admin)');

      const { data, error } = await this.supabase
        .from('perfil')
        .select(`
          *,
          aplicacion:idaplicacion(descripcion)
        `)
        .order('descripcion');

      if (error) {
        throw new Error(`Error obteniendo perfiles: ${error.message}`);
      }

      return data as PerfilDto[];
    } catch (error) {
      this.logger.error('Error obteniendo todos los perfiles:', error);
      throw error;
    }
  }
}