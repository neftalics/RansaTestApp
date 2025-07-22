import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AplicacionRepository } from '../database/repositories/aplicacion.repository';
import { UserContext } from '../database/sequelize.config';
import { 
  AplicacionDto, 
  AplicacionResponseDto, 
  CreateAplicacionDto, 
  UpdateAplicacionDto 
} from './dto/aplicacion.dto';

@Injectable()
export class AplicacionService {
  constructor(
    private readonly aplicacionRepository: AplicacionRepository,
  ) {}

  /**
   * Obtiene las aplicaciones a las que el usuario tiene acceso
   * Usa Sequelize + RLS automático
   */
  async obtenerAplicacionesUsuario(
    context: UserContext,
  ): Promise<AplicacionResponseDto> {
    try {
      const aplicaciones = await this.aplicacionRepository.findAplicacionesUsuario(context);
      
      return {
        success: true,
        data: aplicaciones,
        message: 'Aplicaciones obtenidas exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || 'Error obteniendo aplicaciones',
      };
    }
  }

  /**
   * Verifica acceso usando función RPC de Supabase
   */
  async verificarAccesoApp(
    appId: string,
    context: UserContext,
  ): Promise<boolean> {
    return this.aplicacionRepository.verificarAccesoApp(appId, context);
  }

  /**
   * Crea una nueva aplicación (solo admins) - usa Sequelize + triggers
   */
  async crearAplicacion(
    createAplicacionDto: CreateAplicacionDto,
    context: UserContext,
  ): Promise<AplicacionDto> {
    try {
      if (!createAplicacionDto.descripcion?.trim()) {
        throw new BadRequestException('Descripción requerida');
      }

      const aplicacion = await this.aplicacionRepository.createAplicacion(
        createAplicacionDto.descripcion.trim(),
        context,
      );

      return {
        idaplicacion: aplicacion.idaplicacion,
        descripcion: aplicacion.descripcion,
        fechacreacion: aplicacion.fechacreacion ? aplicacion.fechacreacion.toISOString() : null,
        usuariocreacion: aplicacion.usuariocreacion,
        fechaactualizacion: aplicacion.fechaactualizacion ? aplicacion.fechaactualizacion.toISOString() : null,
        usuarioactualizacion: aplicacion.usuarioactualizacion,
        estado: aplicacion.estado,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza una aplicación existente (solo admins)
   */
  async actualizarAplicacion(
    id: string,
    updateAplicacionDto: UpdateAplicacionDto,
    context: UserContext,
  ): Promise<AplicacionDto> {
    try {
      if (!id) {
        throw new BadRequestException('ID de aplicación requerido');
      }

      if (!updateAplicacionDto.descripcion?.trim()) {
        throw new BadRequestException('Descripción requerida para actualizar');
      }

      const aplicacion = await this.aplicacionRepository.updateAplicacion(
        id,
        updateAplicacionDto.descripcion.trim(),
        context,
      );

      if (!aplicacion) {
        throw new NotFoundException('Aplicación no encontrada');
      }

      return {
        idaplicacion: aplicacion.idaplicacion,
        descripcion: aplicacion.descripcion,
        fechacreacion: aplicacion.fechacreacion ? aplicacion.fechacreacion.toISOString() : null,
        usuariocreacion: aplicacion.usuariocreacion,
        fechaactualizacion: aplicacion.fechaactualizacion ? aplicacion.fechaactualizacion.toISOString() : null,
        usuarioactualizacion: aplicacion.usuarioactualizacion,
        estado: aplicacion.estado,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina una aplicación (borrado lógico vía trigger)
   */
  async eliminarAplicacion(
    id: string,
    context: UserContext,
  ): Promise<void> {
    try {
      if (!id) {
        throw new BadRequestException('ID de aplicación requerido');
      }

      const deleted = await this.aplicacionRepository.deleteAplicacion(id, context);
      
      if (!deleted) {
        throw new NotFoundException('Aplicación no encontrada');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todas las aplicaciones (solo para administradores)
   */
  async obtenerTodasLasAplicaciones(context: UserContext): Promise<AplicacionDto[]> {
    return this.aplicacionRepository.findAllAplicaciones(context);
  }
}