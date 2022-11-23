import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    try {
      const user = await this.userService.getUser(username);
      if (user.getPassword() === password) {
        return user;
      }
    } catch (e) {
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);
    }
    throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
  }

  async login(user: Identity) {
    const payload = { user };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
