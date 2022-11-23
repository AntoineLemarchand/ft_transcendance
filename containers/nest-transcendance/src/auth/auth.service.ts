import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Identity } from './auth.local.strategy';
import User from '../user/user.entities';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.getUser(username);
    if (!user)
      throw new Error('could not find user');
    if (user.getPassword() === password) {
      return user;
    }
    throw new Error('could not find user');
  }

  async login(user: Identity) {
    const payload = { user };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
