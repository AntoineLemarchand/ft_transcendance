import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, Identity } from './auth.service';
import { Strategy, VerifyCallback } from 'passport-oauth2';

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/oauth/callback',
    });
  }

  async validate(accessToken: string, cb: VerifyCallback): Promise<any> {
    const userData = await this.authService.fetchUser(accessToken);
    console.log(userData.id);
    console.log(userData.first_name);
    console.log(userData.last_name);
  }
}
