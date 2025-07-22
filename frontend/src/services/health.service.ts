// src/services/health.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { HealthResponse } from '../types/health.types';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly baseUrl = `${environment.apiUrl}/health`;

  constructor(private http: HttpClient) {}

  /** Estado general */
  getSystem(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(this.baseUrl);
  }

  /** Configuración de entorno */
  getConfig(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/config`);
  }

  /** Conexión a BD */
  getDatabase(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/database`);
  }

  /** Prueba funciones RPC */
  getRpc(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/test-rpc`);
  }

  /** Tablas principales */
  getTables(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/tables`);
  }

  /** Conexión simple a Supabase */
  getSupabaseSimple(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/supabase-simple`);
  }

  /** Sincroniza modelos */
  getSyncModels(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/sync-models`);
  }

  /** Conexión a Supabase */
  getSupabase(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/supabase`);
  }
}
