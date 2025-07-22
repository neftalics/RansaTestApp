import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GetUserContext } from '../common/decorators/user-context.decorator';
import { UserContext } from '../database/sequelize.config';
import { AplicacionService } from './aplicacion.service';
import { CreateAplicacionDto, UpdateAplicacionDto } from './dto/aplicacion.dto';

@Controller('aplicacion')
@UseGuards(JwtAuthGuard)
export class AplicacionController {
  constructor(private readonly aplicacionService: AplicacionService) {}

  /**
   * GET /aplicacion/usuario
   * Obtiene las aplicaciones a las que el usuario tiene acceso
   */
  @Get('usuario')
  async obtenerAplicacionesUsuario(@GetUserContext() context: UserContext) {
    return this.aplicacionService.obtenerAplicacionesUsuario(context);
  }

  /**
   * GET /aplicacion/admin/todas
   * Obtiene todas las aplicaciones (solo admins)
   */
  @Get('admin/todas')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async obtenerTodasLasAplicaciones(@GetUserContext() context: UserContext) {
    // Debug: imprime el contexto de usuario recibido
    console.log('Contexto recibido en controlador:', context);

    const aplicaciones =
      await this.aplicacionService.obtenerTodasLasAplicaciones(context);

    return {
      success: true,
      data: aplicaciones,
      message: 'Aplicaciones obtenidas exitosamente',
    };
  }

  /**
   * POST /aplicacion
   * Crea una nueva
   * aplicación (solo admins)
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async crearAplicacion(
    @Body() createAplicacionDto: CreateAplicacionDto,
    @GetUserContext() context: UserContext,
  ) {
    const aplicacion = await this.aplicacionService.crearAplicacion(
      createAplicacionDto,
      context,
    );

    return {
      success: true,
      data: aplicacion,
      message: 'Aplicación creada exitosamente',
    };
  }

  /**
   * PUT /aplicacion/:id
   * Actualiza una aplicación (solo admins)
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async actualizarAplicacion(
    @Param('id') id: string,
    @Body() updateAplicacionDto: UpdateAplicacionDto,
    @GetUserContext() context: UserContext,
  ) {
    const aplicacion = await this.aplicacionService.actualizarAplicacion(
      id,
      updateAplicacionDto,
      context,
    );

    return {
      success: true,
      data: aplicacion,
      message: 'Aplicación actualizada exitosamente',
    };
  }

  /**
   * DELETE /aplicacion/:id
   * Elimina una aplicación (solo admins)
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async eliminarAplicacion(
    @Param('id') id: string, 
    @GetUserContext() context: UserContext
  ) {
    await this.aplicacionService.eliminarAplicacion(id, context);

    return {
      success: true,
      message: 'Aplicación eliminada exitosamente',
    };
  }
}
