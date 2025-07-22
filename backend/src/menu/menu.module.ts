import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { SupabaseRpcHelper } from '../common/supabase-rpc.helper';

@Module({
  imports: [ConfigModule],
  controllers: [MenuController],
  providers: [MenuService, SupabaseRpcHelper],
  exports: [MenuService],
})
export class MenuModule {}