import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HealthService } from '../../services/health.service';
import { HealthResponse, HealthCheck } from '../../types/health.types';

type CardHealth = {
  service: string;
  status: 'healthy' | 'unhealthy';
  checks: Record<string, HealthCheck>;
  timestamp?: string;
  isLoading: boolean;
};

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.css']
})
export class HealthComponent implements OnInit {
  healthChecks = signal<CardHealth[]>([]);
  isRefreshing = signal(false);

  constructor(private healthService: HealthService) {}

  ngOnInit(): void {
    this.refreshAll();
  }

  refreshAll(): void {
    this.isRefreshing.set(true);

    const sources = [
      { name: 'API General',      obs: this.healthService.getSystem() },
      { name: 'Configuración',    obs: this.healthService.getConfig() },
      { name: 'Base de Datos',    obs: this.healthService.getDatabase() },
      { name: 'Funciones RPC',    obs: this.healthService.getRpc() },
      { name: 'Tablas',           obs: this.healthService.getTables() },
      { name: 'Supabase Simple',  obs: this.healthService.getSupabaseSimple() },
      { name: 'Supabase',         obs: this.healthService.getSupabase() },
      { name: 'Sincronización',   obs: this.healthService.getSyncModels() }
    ];

    // Inicializa tarjetas en modo "cargando"
    this.healthChecks.set(
      sources.map(s => ({
        service: s.name,
        status: 'unhealthy',
        checks: {},
        isLoading: true
      }))
    );

    forkJoin(
      sources.map(s => s.obs.pipe(catchError(() => of(null))))
    ).subscribe(results => {
      const mapStatus = (s: any): 'healthy' | 'unhealthy' =>
        s === 'healthy' || s === 'ok' ? 'healthy' : 'unhealthy';

      const updated: CardHealth[] = results.map((res, i) => {
        if (res) {
          return {
            service: sources[i].name,
            status: mapStatus(res.status),
            checks: res.checks ?? {},
            timestamp: (res as any).timestamp,
            isLoading: false
          };
        }
        // Error en la petición
        return {
          service: sources[i].name,
          status: 'unhealthy',
          checks: {
            error: {
              status: 'error',
              message: 'Error al conectar con el servicio',
              timestamp: new Date().toISOString()
            }
          },
          isLoading: false
        };
      });

      this.healthChecks.set(updated);
      this.isRefreshing.set(false);
    });
  }

  getCheckDetails(checks: Record<string, HealthCheck>): { key: string; value: HealthCheck }[] {
    return Object.entries(checks ?? {}).map(([key, value]) => ({ key, value }));
  }

  getLastUpdate(checks: Record<string, HealthCheck>): string | null {
    const timestamps = Object.values(checks ?? {})
      .map(c => c.timestamp)
      .filter(Boolean) as string[];
    return timestamps.length ? timestamps[0] : null;
  }

  formatDateSafe(ts: string | null): string {
    return ts ? new Date(ts).toLocaleString('es-ES') : 'No disponible';
  }

  trackByService = (_: number, item: CardHealth) => item.service;
}
