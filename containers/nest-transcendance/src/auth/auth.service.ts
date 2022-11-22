import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { transfer } from "../app.controller";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.getUser(username);
    if (user.getPassword() === password) {
      return user;
    }
  }

  async login(user: transfer) {
    const payload = { user };
    console.log("sub: " + user.sub);
    return {
      sub: this.jwtService.sign(payload), tomate: "testme "
    };
  }
}
