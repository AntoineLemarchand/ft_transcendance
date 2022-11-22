import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import User from './user/user.entities';

@Module({
  imports: [UserModule, GameModule, AuthModule, User],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
