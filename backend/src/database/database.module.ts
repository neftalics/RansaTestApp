import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeConfigService } from './sequelize.config';
import { AplicacionRepository } from './repositories/aplicacion.repository';
import { MenuRepository } from './repositories/menu.repository';
import { PerfilRepository } from './repositories/perfil.repository';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    SequelizeConfigService,
    AplicacionRepository,
    MenuRepository,
    PerfilRepository,
  ],
  exports: [
    SequelizeConfigService,
    AplicacionRepository,
    MenuRepository,
    PerfilRepository,
  ],
})
export class DatabaseModule {
  constructor(private sequelizeConfig: SequelizeConfigService) {
    // Verificar conexión al inicializar
    this.testConnection();
  }

  private async testConnection() {
    const isConnected = await this.sequelizeConfig.testConnection();
    if (!isConnected) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }
  }
}