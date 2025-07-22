// src/services/api-error-handler.service.ts
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

@Injectable({ providedIn: 'root' })
export class ApiErrorHandlerService {
  /** Convierte HttpErrorResponse en un ApiError legible */
  handleError(error: HttpErrorResponse): ApiError {
    let message = 'Ha ocurrido un error inesperado';
    const status = error.status;

    if (error.error instanceof ErrorEvent) {
      message = `Error: ${error.error.message}`;
    } else {
      switch (status) {
        case 0:   message = 'Sin conexión con el servidor'; break;
        case 400: message = error.error?.message || 'Solicitud inválida'; break;
        case 401: message = 'No autorizado. Inicia sesión de nuevo.'; break;
        case 403: message = 'Acceso prohibido'; break;
        case 404: message = 'Recurso no encontrado'; break;
        case 500: message = 'Error interno del servidor'; break;
        default:  message = error.error?.message || `Error ${status}: ${error.statusText}`;
      }
    }

    return { message, status, details: error.error };
  }

  /** Loggea el error en consola (o lo envías a tu sistema) */
  logError(apiError: ApiError, context?: string): void {
    console.error(context ? `[${context}] ${apiError.message}` : apiError.message, apiError.details);
  }
}
