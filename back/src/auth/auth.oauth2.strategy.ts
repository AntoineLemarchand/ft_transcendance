import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, Identity } from './auth.service';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: 'http://' + process.env.SERVER_URL + ':' + process.env.SERVER_PORT + '/api/auth/oauth/callback',
    });
  }

  async validate(accessToken: string): Promise<any> {
    const userData = await this.authService.getFortyTwoUser(accessToken);
    if (!userData)
      return new Identity('', 999, accessToken);
    else
      return new Identity(userData.name, 999, accessToken);
  }
}
