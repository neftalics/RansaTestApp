export interface Menu {
  id: number;
  nombre: string;
  ruta?: string;
  icono?: string;
  orden: number;
  padre_id?: number;
  aplicacion_id: number;
  activo: boolean;
  children?: Menu[];
}

export interface MenuUsuario extends Menu {
  tiene_acceso: boolean;
}

export interface VerificarAccesoDto {
  usuario_id: string;
  menu_id: number;
}