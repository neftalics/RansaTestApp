export interface Perfil {
  id: number;
  nombre: string;
  descripcion?: string;
  aplicacion_id: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePerfilDto {
  nombre: string;
  descripcion?: string;
  aplicacion_id: number;
  activo?: boolean;
}

export interface UpdatePerfilDto extends Partial<CreatePerfilDto> {
  id: number;
}

export interface AsignarPerfilDto {
  usuario_id: string;
  perfil_id: number;
}