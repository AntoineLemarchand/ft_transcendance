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
    const userData = await this.authService.fetchUser(accessToken);
    try {
      await this.authService.validateUser(userData.login, '');
    } catch (HttpException) {
      await this.authService.createUser({
        username: userData.login,
        password: '',
      });
    }
    return new Identity(userData.login, 999);
  }
}
