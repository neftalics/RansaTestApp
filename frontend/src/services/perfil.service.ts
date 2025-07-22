// src/services/perfil.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  Perfil,
  CreatePerfilDto,
  UpdatePerfilDto,
  AsignarPerfilDto
} from '../types/perfil.types';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly baseUrl = `${environment.apiUrl}/perfil`;

  constructor(private http: HttpClient) {}

  /** Perfiles de una app */
  getByAplicacion(appId: string): Observable<Perfil[]> {
    return this.http.get<Perfil[]>(`${this.baseUrl}/aplicacion/${appId}`);
  }

  /** Todos los perfiles (admin) */
  getAll(): Observable<Perfil[]> {
    return this.http.get<Perfil[]>(`${this.baseUrl}/admin/todos`);
  }

  /** Crea nuevo perfil (admin) */
  create(dto: CreatePerfilDto): Observable<Perfil> {
    return this.http.post<Perfil>(this.baseUrl, dto);
  }

  /** Actualiza perfil por id (admin) */
  update(id: string, dto: UpdatePerfilDto): Observable<Perfil> {
    return this.http.put<Perfil>(`${this.baseUrl}/${id}`, dto);
  }

  /** Elimina perfil por id (admin) */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Asigna un perfil a un usuario (admin) */
  assignToUser(dto: AsignarPerfilDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/asignar-usuario`, dto);
  }
}
