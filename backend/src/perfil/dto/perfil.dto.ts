export class PerfilDto {
  idperfil: string;
  idaplicacion: string;
  descripcion: string;
  fechacreacion: string;
  usuariocreacion: string;
  fechaactualizacion?: string;
  usuarioactualizacion?: string;
  estado: boolean;
}

export class PerfilResponseDto {
  success: boolean;
  data: PerfilDto[];
  message?: string;
}

export class CreatePerfilDto {
  idaplicacion: string;
  descripcion: string;
}

export class UpdatePerfilDto {
  descripcion?: string;
}

export class AsignarPerfilUsuarioDto {
  user_id: string;
  idperfil: string;
}