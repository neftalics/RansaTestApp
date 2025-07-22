export interface Aplicacion {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAplicacionDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateAplicacionDto extends Partial<CreateAplicacionDto> {
  id: number;
}