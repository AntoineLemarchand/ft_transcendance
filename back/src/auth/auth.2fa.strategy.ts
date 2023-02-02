import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './auth.jwt.strategy';
import { User } from '../user/user.entities';
import { UserService } from '../user/user.service';
import { Request as RequestType } from 'express';

@Injectable()
export class JwtTwoFaStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET_PASSWORD,
    });
  }

  async validate(payload: any): Promise<User | null> {
    const username = payload.user.name;
    const user = await this.userService.getUser(username);
    if (user && (user.secret2fa === '' || payload.user.hasSucceeded2Fa))
      return user as User;
    return null;
  }
}
