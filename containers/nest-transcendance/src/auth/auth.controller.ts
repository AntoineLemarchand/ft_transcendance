import {
  Body,
  Controller,
  Post,
  Get,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { Oauth2Guard } from './Oauth2.guard';
import { AuthService, Identity } from './auth.service';
import { CreateUserDTO } from '../app.controller';
import { AuthModule } from './auth.module';
import { Response as ExpressResponse } from 'express';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Request() req: Express.Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<{ access_token: string }> {
    const token = this.authService.login(req.user as Identity);
    res.cookie('token', { access_token: token });
    return token;
  }

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  async signin(
    @Body() userCandidate: CreateUserDTO,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const token = await this.authService.createUser(userCandidate);
    res.cookie('token', { access_token: token });
    return token;
  }

  @Post('loginOauth')
  @UseGuards(Oauth2Guard)
  async signinFortyTwo(
    @Body() userCandidate: CreateUserDTO,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<{ access_token: string }> {
    const token = { access_token: 'future token' };
    return token;
  }
}
