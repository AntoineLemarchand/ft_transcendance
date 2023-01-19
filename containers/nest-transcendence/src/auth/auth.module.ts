import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './auth.local.strategy';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { environment } from '../utils/environmentParser';
import { JwtStrategy } from './auth.jwt.strategy';
import { AuthController } from './auth.controller';
import { ChannelModule } from '../channel/channel.module';
import {BroadcastingModule} from '../broadcasting/broadcasting.module';
import {GameModule} from '../game/game.module';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    forwardRef(() => ChannelModule),
    JwtModule.register({
      secret: environment.JWT_SECRET_PASSWORD,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [AuthService, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
