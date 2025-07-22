// src/services/aplicacion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import {
  Aplicacion,
  CreateAplicacionDto,
  UpdateAplicacionDto
} from '../types/aplicacion.types';

@Injectable({ providedIn: 'root' })
export class AplicacionService {
  private readonly baseUrl = `${environment.apiUrl}/aplicacion`;

  constructor(private http: HttpClient) {}

  /** Apps asignadas al usuario */
  getByUsuario(): Observable<Aplicacion[]> {
    return this.http.get<Aplicacion[]>(`${this.baseUrl}/usuario`);
  }

  /** Todas las apps (solo admin) */
  getAll(): Observable<Aplicacion[]> {
    return this.http.get<Aplicacion[]>(`${this.baseUrl}/admin/todas`);
  }

  /** Crea nueva aplicación (admin) */
  create(dto: CreateAplicacionDto): Observable<Aplicacion> {
    return this.http.post<Aplicacion>(this.baseUrl, dto);
  }

  /** Actualiza aplicación por id (admin) */
  update(id: string, dto: UpdateAplicacionDto): Observable<Aplicacion> {
    return this.http.put<Aplicacion>(`${this.baseUrl}/${id}`, dto);
  }

  /** Elimina aplicación por id (admin) */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
