import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './auth.local.strategy';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth.jwt.strategy';
import { AuthController } from './auth.controller';
// import { User } from '../user/user.entities';
import { ChannelModule } from '../channel/channel.module';
import { Oauth2Strategy } from './auth.oauth2.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy, Oauth2Strategy],
  imports: [
    ConfigModule.forRoot(),
    forwardRef(() => UserModule),
    PassportModule,
    forwardRef(() => ChannelModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET_PASSWORD,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [AuthService, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
