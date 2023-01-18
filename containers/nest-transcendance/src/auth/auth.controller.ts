import {
  Body,
  Controller,
  Post,
  Get,
  Request,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { Oauth2Guard } from './Oauth2.guard';
import { AuthService, Identity } from './auth.service';
import { CreateUserDTO } from '../app.controller';
import { Response as ExpressResponse } from 'express';
import User from '../user/user.entities';

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

  @Get('oauth/callback')
  @UseGuards(Oauth2Guard)
  async signinFortyTwo(
    @Request() req: Express.Request,
    @Res() res: ExpressResponse,
  ) {
    const { access_token: token } = await this.authService.login(req.user as Identity);
    const userInfo = this.authService.getUserInfo(req.user as Identity);
    res.cookie('auth', token);
    res.cookie('userInfo', userInfo);

    res.redirect('http://localhost:3001/home');
    return token;
  }

}
