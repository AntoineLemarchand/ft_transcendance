import { PassportStrategy } from '@nestjs/passport';
import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, Identity } from './auth.service';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import User from '../user/user.entities';

@Injectable()
export class Oauth2Strategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
  ) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/oauth/callback',
    });
  }

  // goal : check if is user request with 42api is find and return it
  async validate(
    accessToken: string,
    profile: User,
    cb: VerifyCallback,
  ) : Promise<Identity> {
    const userCandidate = await this.authService.fetchUser(accessToken);
    let user;
    let userCreate;
    try {
      user = await this.authService.validateUser(userCandidate.login, '');
      console.log(user);
    }
    catch (HttpException) {
      let userCreate = await this.authService.createUser({
        username: userCandidate.login,
        password: '',
      });
    }
    return new Identity(userCandidate.login, 999);
  }

}
