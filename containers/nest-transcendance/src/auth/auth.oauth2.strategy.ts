import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, Identity } from './auth.service';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
  constructor(private authService: AuthService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/fortytwo/callback',
    });
  }

  async validate(accessToken: string): Promise<any> {
    // const data  = http.get('https://api.intra.42.fr/v2/me', {
    //   headers: { Authorization: `Bearer ${ accessToken }` },
    // })
    // ;
  }
}
