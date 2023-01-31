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

  // request 42api to validate 42user
  // case if user in not a 42 user ??

  async validate(accessToken: string): Promise<any> {
    // request 42api to collect data user
    const userData = await this.authService.fetchUser(accessToken);

    try {
      // case 1 : user register in DB
      // case username already register with same login ??
      await this.authService.validateUser(userData.login, '', accessToken);
      return new Identity(userData.login, 999, '');

    } catch (HttpException) {
      // STEP 1: GET USER 42API TOKEN
      return new Identity(userData.login, 999, accessToken);
    }
  }
}
