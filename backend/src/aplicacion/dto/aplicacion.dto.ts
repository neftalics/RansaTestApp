export class AplicacionDto {
  idaplicacion: string;
  descripcion: string;
  fechacreacion: string;
  usuariocreacion: string;
  fechaactualizacion?: string;
  usuarioactualizacion?: string;
  estado: boolean;
}

export class AplicacionResponseDto {
  success: boolean;
  data: AplicacionDto[];
  message?: string;
}

export class CreateAplicacionDto {
  descripcion: string;
}

export class UpdateAplicacionDto {
  descripcion?: string;
}