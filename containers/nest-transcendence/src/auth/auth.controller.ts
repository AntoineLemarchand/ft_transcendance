import {
  Body,
  Controller,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService, Identity } from './auth.service';
import { CreateUserDTO } from '../app.controller';
import { Response as ExpressResponse } from 'express';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: Express.Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<{ access_token: string }> {
    const token = this.authService.login(req.user as Identity);
    res.cookie('token', { access_token: token });
    return token;
  }

  @Post('signin')
  async signin(
    @Body() userCandidate: CreateUserDTO,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    console.log(userCandidate);
    const token = await this.authService.createUser(userCandidate);
    res.cookie('token', { access_token: token });
    return token;
  }
}
