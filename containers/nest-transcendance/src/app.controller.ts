import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService, Identity } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt.auth.guard';

export class CreateUserDTO {
  username: string;
  password: string;
}

@Controller()
export class AppController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req: Express.Request): Promise<{ access_token: string }> {
    return this.authService.login(req.user as Identity);
  }

  @Post('auth/signin')
  async signin(@Body() userCandidate: CreateUserDTO) {
    const token = this.authService.createUser(userCandidate);
    return token;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return req.user;
  }
}
