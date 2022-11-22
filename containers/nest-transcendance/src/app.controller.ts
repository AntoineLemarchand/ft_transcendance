import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import User from './user/user.entities';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt.auth.guard';

export interface transfer {
  username: string;
  sub: string;
}

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  //todo: try to find alternative to any type
  async login(@Request() req: Express.Request): Promise<{ sub: string }> {
    const t: transfer = req.user as transfer;
    return this.authService.login(t);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  //todo: try to find alternative to any type
  async getProfile(@Request() req: any) {
    return req.user;
  }
}
