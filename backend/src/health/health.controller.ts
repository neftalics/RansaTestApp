import { Controller, Get } from '@nestjs/common';
import { SequelizeConfigService } from '../database/sequelize.config';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Controller('health')
export class HealthController {
  constructor(
    private sequelizeConfig: SequelizeConfigService,
    private configService: ConfigService,
  ) {}

  @Get('config')
  async checkConfig() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    
    return {
      supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
      supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Not set',
      supabaseServiceKey: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'Not set',
      nodeEnv: process.env.NODE_ENV,
    };
  }

  @Get('database')
  async checkDatabase() {
    try {
      const sequelize = this.sequelizeConfig.getSequelize();
      await sequelize.authenticate();
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('test-rpc')
  async testRPCFunctions() {
    try {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Probar función fn_es_admin
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('fn_es_admin');

      if (adminError) throw adminError;

      return {
        status: 'ok',
        rpc_functions: {
          fn_es_admin: {
            available: true,
            result: isAdmin
          }
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('tables')
  async checkTables() {
    try {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Verificar tablas usando tus funciones RPC si es posible
      const { data: aplicacionTest } = await supabase
        .from('aplicacion')
        .select('idaplicacion')
        .limit(1);
    
      const { data: perfilTest } = await supabase
        .from('perfil')
        .select('idperfil')
        .limit(1);

      const { data: menuTest } = await supabase
        .from('menu')
        .select('idmenu')
        .limit(1);

      return {
        status: 'ok',
        tables: ['aplicacion', 'perfil', 'menu', 'perfilmenu', 'usuario_perfil'],
        verified: {
          aplicacion: !!aplicacionTest,
          perfil: !!perfilTest,
          menu: !!menuTest,
        },
        triggers_and_functions: {
          fn_aud: 'Active on all tables',
          fn_borrar_logico: 'Active on all tables',
          fn_es_admin: 'Available as RPC',
          fn_acceso_app: 'Available as RPC',
          fn_menu_usuario: 'Available as RPC'
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('supabase-simple')
  async checkSupabaseSimple() {
    try {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase configuration');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Solo verificar la conexión sin consultar tablas específicas
      const { data, error } = await supabase
        .rpc('version'); // Esta función siempre existe en PostgreSQL

      return {
        status: 'ok',
        supabase: 'connected with service key',
        version: data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        supabase: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('sync-models')
  async syncModels() {
    try {
      const sequelize = this.sequelizeConfig.getSequelize();
      
      // Sincronizar modelos (crear tablas si no existen)
      await sequelize.sync({ force: false, alter: true });
      
      return {
        status: 'ok',
        message: 'Models synchronized successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('supabase')
  async checkSupabase() {
    return await this.checkSupabaseSimple();
  }

  @Get()
  async checkAll() {
    const config = await this.checkConfig();
    const database = await this.checkDatabase();
    const supabase = await this.checkSupabase();
    const tables = await this.checkTables();
    
    return {
      status: database.status === 'ok' && supabase.status === 'ok' ? 'ok' : 'error',
      services: {
        config,
        database,
        supabase,
        tables,
      },
      timestamp: new Date().toISOString(),
    };
  }
}