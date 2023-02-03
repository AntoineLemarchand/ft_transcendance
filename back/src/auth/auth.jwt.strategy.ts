import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request as RequestType } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET_PASSWORD,
    });
  }

  async validate(payload: Express.Request): Promise<any> {
    return payload.user;
  }

  static extractJWT(req: RequestType): string {
    if (req.cookies && 'auth' in req.cookies && req.cookies.auth.length > 0) {
      return req.cookies.auth;
    }
    throw new UnauthorizedException();
  }
}
