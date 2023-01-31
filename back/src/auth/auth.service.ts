import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entities';
import { CreateUserDTO } from '../app.controller';
import { ErrForbidden, ErrUnAuthorized } from '../exceptions';
import axios from 'axios'

export class Identity {
  constructor(public name: string, public id: number, public accessToken: string) {}
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string, accessToken?: string): Promise<User> {
    const user = await this.userService.getUser(username, accessToken);
    if (user !== undefined) {
      if (user.comparePassword(password) || user.accessToken) return user;
      throw new ErrUnAuthorized('Wrong password');
    }
    throw new ErrUnAuthorized('Could not find user');
  }

  async login(user: Identity) {
    const payload = { user };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createUser(userCandidate: CreateUserDTO) {
    const user = await this.userService.getUser(userCandidate.username, userCandidate.accessToken);
    if (user !== undefined) throw new ErrUnAuthorized('User already exists');
    if (userCandidate.username.includes('_'))
      throw new ErrForbidden('no underscores in usernames');
    const newUser: User = new User(
      userCandidate.username,
      userCandidate.password,
      userCandidate.accessToken
    );
    if (userCandidate.image) {
      newUser.image = userCandidate.image.buffer;
      newUser.imageFormat = userCandidate.image.mimetype;
    }

    await this.userService.createUser(newUser);
    return this.login(new Identity(userCandidate.username, 1, ''));
  }

  async fetchUser(accessToken: string): Promise<any> {
    const { data: searchResponse } = await axios.get('https://api.intra.42.fr/v2/me', {
      headers: {
        'Authorization': `Bearer ${ accessToken }`,
      }
    });
    return searchResponse;
  }

  async getUserInfo(user: Identity): Promise<any> {
    return this.userService.getUser(user.name);
  }
}
