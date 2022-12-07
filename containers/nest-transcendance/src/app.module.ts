import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import User from './user/user.entities';
import { RouterModule } from '@nestjs/core';
import { BroadcastingGateway } from './broadcasting/broadcasting.gateway';
import { ChannelModule } from './channel/channel.module';

@Module({
  imports: [
    UserModule,
    GameModule,
    AuthModule,
    ChannelModule,
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
      {
        path: 'channel',
        module: ChannelModule,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
