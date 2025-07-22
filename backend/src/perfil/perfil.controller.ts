import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PerfilService } from './perfil.service';
import { CreatePerfilDto, UpdatePerfilDto, AsignarPerfilUsuarioDto } from './dto/perfil.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('perfil')
@UseGuards(JwtAuthGuard)
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Get('aplicacion/:idAplicacion')
  async obtenerPerfilesPorAplicacion(
    @Param('idAplicacion') idAplicacion: string,
    @Request() req: any
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.perfilService.obtenerPerfilesPorAplicacion(idAplicacion, token);
  }

  @Get('admin/todos')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async obtenerTodosLosPerfiles() {
    return this.perfilService.obtenerTodosLosPerfiles();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async crearPerfil(
    @Body() createPerfilDto: CreatePerfilDto,
    @Request() req: any
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.perfilService.crearPerfil(createPerfilDto, token);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async actualizarPerfil(
    @Param('id') id: string,
    @Body() updatePerfilDto: UpdatePerfilDto,
    @Request() req: any
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.perfilService.actualizarPerfil(id, updatePerfilDto, token);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async eliminarPerfil(@Param('id') id: string, @Request() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    await this.perfilService.eliminarPerfil(id, token);
    return { message: 'Perfil eliminado exitosamente' };
  }

  @Post('asignar-usuario')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async asignarPerfilUsuario(
    @Body() asignarDto: AsignarPerfilUsuarioDto,
    @Request() req: any
  ) {
    const token = req.headers.authorization?.split(' ')[1];
    await this.perfilService.asignarPerfilUsuario(asignarDto, token);
    return { message: 'Perfil asignado exitosamente al usuario' };
  }
}