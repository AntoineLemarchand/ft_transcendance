import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { environment } from '../utils/environmentParser';
import { Request as RequestType } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: environment.JWT_SECRET_PASSWORD,
    });
  }

  //todo: generate typed object
  async validate(payload: Express.Request): Promise<any> {
    return payload.user;
  }

  static extractJWT(req: RequestType): string | null {
    console.log('trying to find cookies');
    if (req.cookies && 'auth' in req.cookies && req.cookies.auth.length > 0) {
      console.log('yay, found cookie');
      console.log(req.cookies.auth);
      return req.cookies.auth;
    }
    return null;
  }
}
