import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AplicacionController } from './aplicacion.controller';
import { AplicacionService } from './aplicacion.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AplicacionController],
  providers: [AplicacionService],
  exports: [AplicacionService],
})
export class AplicacionModule {}