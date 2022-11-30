import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import User from './user/user.entities';
import { RouterModule } from '@nestjs/core';
import { BroadcastingGateway } from './broadcasting/broadcasting.gateway';

@Module({
  imports: [
    UserModule,
    GameModule,
    AuthModule,
    User,
    RouterModule.register([
      {
        path: 'user',
        module: UserModule,
      },
      {
        path: 'auth',
        module: AuthModule,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, BroadcastingGateway],
})
export class AppModule {}
