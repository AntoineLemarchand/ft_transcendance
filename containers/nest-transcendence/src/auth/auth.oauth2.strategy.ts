import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, Identity } from './auth.service';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    console.log(process.env.FORTYTWO_CLIENT_ID);
    console.log(process.env.FORTYTWO_CLIENT_SECRET);
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      // callbackURL: 'http://' + process.env.SERVER_URL + '/api/auth/oauth/callback',
      callbackURL: 'http://' + 'localhost' + '/api/auth/oauth/callback',
      // callbackURL: 'https://www.google.com/',
    });
  }

  async validate(accessToken: string): Promise<any> {
    console.log('validate');
    return new Identity('non', 44);
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
