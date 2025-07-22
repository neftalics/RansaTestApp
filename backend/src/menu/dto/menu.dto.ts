export class MenuItemDto {
  idmenu: string;
  descripcion: string;
  menupadre?: string;
  icono?: string;
  path?: string;
}

export class MenuUsuarioRequestDto {
  app_id: string;
}

export class MenuUsuarioResponseDto {
  success: boolean;
  data: MenuItemDto[];
  message?: string;
}

export class VerificarAccesoDto {
  app_id: string;
}

export class AccesoAppResponseDto {
  success: boolean;
  tieneAcceso: boolean;
  message?: string;
}