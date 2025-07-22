// src/services/menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { MenuUsuario } from '../types/menu.types';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly baseUrl = `${environment.apiUrl}/menu`;

  constructor(private http: HttpClient) {}

  /** Menú autorizado para el usuario */
  getForUser(appId: string): Observable<MenuUsuario[]> {
    const params = new HttpParams().set('app_id', appId);
    return this.http.get<MenuUsuario[]>(`${this.baseUrl}/usuario`, { params });
  }

  /** Verifica acceso a una app */
  checkAccess(appId: string): Observable<{ access: boolean }> {
    const params = new HttpParams().set('app_id', appId);
    return this.http.get<{ access: boolean }>(`${this.baseUrl}/verificar-acceso`, { params });
  }

  /** Todos los menús (admin) */
  getAll(): Observable<MenuUsuario[]> {
    return this.http.get<MenuUsuario[]>(`${this.baseUrl}/admin/todos`);
  }

  /** Verifica si el usuario es admin */
  isAdmin(): Observable<{ isAdmin: boolean }> {
    return this.http.get<{ isAdmin: boolean }>(`${this.baseUrl}/es-admin`);
  }
}
