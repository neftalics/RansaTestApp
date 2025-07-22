import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface RpcResult<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class SupabaseRpcHelper {
  private readonly logger = new Logger(SupabaseRpcHelper.name);
  private readonly supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuración de Supabase incompleta');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  /**
   * Ejecuta una función RPC de Supabase con contexto de usuario
   */
  async executeRpc<T>(
    functionName: string,
    params: Record<string, any> = {},
    userToken?: string
  ): Promise<RpcResult<T>> {
    try {
      this.logger.debug(`Ejecutando RPC: ${functionName}`, params);
      
      // Crear cliente con contexto de usuario si se proporciona token
      const client = userToken ? this.createUserClient(userToken) : this.supabase;
      
      // Ejecutar función RPC
      const { data, error } = await client.rpc(functionName, params);

      if (error) {
        throw new Error(`Error en RPC ${functionName}: ${error.message}`);
      }

      this.logger.debug(`RPC ${functionName} ejecutado exitosamente`);
      
      return {
        success: true,
        data: data as T,
        message: `${functionName} ejecutado correctamente`
      };
    } catch (error) {
      this.logger.error(`Error ejecutando RPC ${functionName}:`, error);
      return {
        success: false,
        data: null as T,
        message: error.message || `Error ejecutando ${functionName}`
      };
    }
  }

  /**
   * Ejecuta una función RPC que retorna un boolean
   */
  async executeRpcBoolean(
    functionName: string,
    params: Record<string, any> = {},
    userToken?: string
  ): Promise<boolean> {
    try {
      const result = await this.executeRpc<any[]>(functionName, params, userToken);
      
      if (!result.success || !result.data || result.data.length === 0) {
        return false;
      }

      return Boolean(result.data);
    } catch (error) {
      this.logger.error(`Error ejecutando RPC boolean ${functionName}:`, error);
      return false;
    }
  }

  /**
   * Ejecuta una consulta directa en Supabase con contexto de usuario
   */
  async executeQuery<T>(
    tableName: string,
    selectFields: string = '*',
    filters: Record<string, any> = {},
    userToken?: string
  ): Promise<RpcResult<T[]>> {
    try {
      this.logger.debug(`Ejecutando consulta en tabla: ${tableName}`);
      
      const client = userToken ? this.createUserClient(userToken) : this.supabase;
      
      let query = client.from(tableName).select(selectFields);
      
      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data, error } = await query;

      if (error) {
        throw new Error(`Error en consulta: ${error.message}`);
      }

      return {
        success: true,
        data: data as T[],
        message: 'Consulta ejecutada correctamente'
      };
    } catch (error) {
      this.logger.error(`Error ejecutando consulta:`, error);
      return {
        success: false,
        data: [],
        message: error.message || 'Error ejecutando consulta'
      };
    }
  }

  /**
   * Crea un cliente Supabase con contexto de usuario específico
   */
  private createUserClient(userToken: string): SupabaseClient {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  /**
   * Verifica la conexión con la base de datos
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.from('aplicacion').select('count').limit(1);
      if (error) throw error;
      this.logger.log('Conexión con Supabase establecida correctamente');
      return true;
    } catch (error) {
      this.logger.error('Error conectando con Supabase:', error);
      return false;
    }
  }
}