import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Aplicacion } from './models/aplicacion.model';
import { Perfil } from './models/perfil.model';
import { Menu } from './models/menu.model';
import { PerfilMenu } from './models/perfil-menu.model';
import { UsuarioPerfil } from './models/usuario-perfil.model';

export interface UserContext {
  userId: string;
  email: string;
  role: string;
  token: string;
}

@Injectable()
export class SequelizeConfigService {
  private readonly logger = new Logger(SequelizeConfigService.name);
  private sequelize: Sequelize;

  constructor(private configService: ConfigService) {
    this.initializeSequelize();
  }

  private initializeSequelize() {
    // Usar DATABASE_URL en lugar de SUPABASE_URL para Sequelize
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    this.logger.log(`Inicializando Sequelize con ${databaseUrl}`);

    if (!databaseUrl) {
      throw new Error('DATABASE_URL no está definido');
    }

    // Parsear la URL para debug
    const url = new URL(databaseUrl);
    this.logger.log(`Conectando a: ${url.hostname}:${url.port || 6543}`);

    this.sequelize = new Sequelize({
      dialect: 'postgres',
      host: url.hostname,
      port: parseInt(url.port) || 6543, // Puerto 6543 para conexiones directas
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      models: [Aplicacion, Perfil, Menu, PerfilMenu, UsuarioPerfil],
      logging: (msg) => this.logger.debug(msg),
      pool: {
        max: 10,
        min: 0,
        acquire: 60000,
        idle: 10000,
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
        connectTimeout: 60000,
      },
      retry: {
        max: 3,
      },
      hooks: {
        beforeConnect: async (config) => {
          this.logger.log('Conectando a PostgreSQL via Sequelize...');
          this.logger.log(`Host: ${config.host}:${config.port}`);
        },
        afterConnect: async (connection) => {
          this.logger.log('Conexión Sequelize establecida exitosamente');
        },
      },
    });
  }

  getSequelize(): Sequelize {
    return this.sequelize;
  }

  /**
   * Establece el contexto de usuario para RLS
   * Usa custom hook que inyecta el contexto JWT
   */
  async setUserContext(context: UserContext, transaction?: any): Promise<void> {
    try {
      const queryOptions: any = {
        replacements: {
          claims: JSON.stringify({
            sub: context.userId,
            email: context.email,
            role: context.role,
            aud: 'authenticated'
          })
        }
      };

      // Si hay transacción, usarla
      if (transaction) {
        queryOptions.transaction = transaction;
      }

      // Establecer variables de sesión para RLS
      await this.sequelize.query(`
        SELECT set_config('request.jwt.claims', :claims, true);
      `, queryOptions);

      this.logger.debug(`Contexto de usuario establecido: ${context.email}`);
    } catch (error) {
      this.logger.error('Error estableciendo contexto de usuario:', error);
      throw error;
    }
  }

  /**
   * Ejecuta una operación con contexto de usuario
   */
  async withUserContext<T>(
    context: UserContext,
    operation: () => Promise<T>
  ): Promise<T> {
    const transaction = await this.sequelize.transaction();
    
    try {
      
      await this.setUserContext(context, transaction);
      
      const result = await operation();
      
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.sequelize.authenticate();
      this.logger.log('Conexión con PostgreSQL verificada exitosamente');
      return true;
    } catch (error) {
      this.logger.error('Error conectando con PostgreSQL:', error);
      return false;
    }
  }
}