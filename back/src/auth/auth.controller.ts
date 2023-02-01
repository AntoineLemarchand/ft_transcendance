import {
  Body,
  Controller,
  Post,
  Get,
  Request,
  Res,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { Oauth2Guard } from './Oauth2.guard';
import { AuthService, Identity } from './auth.service';
import { CreateUserDTO } from '../app.controller';
import { Response as ExpressResponse } from 'express';
import { FileInterceptor } from '@nestjs/platform-express'

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
  @UseInterceptors(FileInterceptor('image'))
  async signin(
    @Body() userCandidate: CreateUserDTO,
    @UploadedFile() image: Express.Multer.File,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    // const userData = await this.authService.fetchUser(req.cookie['access_']);
    if (image)
      userCandidate.image = image;
    const token = await this.authService.createUser(userCandidate);
    return token;
  }

  @Get('oauth/callback')
  @UseGuards(Oauth2Guard)
  async callbackFortyTwo(
    @Request() req: Express.Request,
    @Res() res: ExpressResponse,
  ) {
    const newUser = req.user as Identity;
    try {
      await this.authService.validateUser(newUser.name, '', newUser.accessToken);
      const { access_token: token } = await this.authService.login(newUser);
      const userInfo = this.authService.getUserInfo(newUser);
      res.cookie('auth', token);
      res.cookie('userInfo', userInfo);
      res.redirect('http://' + process.env.SERVER_URL + ':' + process.env.SERVER_PORT + '/home');
      return token;
    }
    catch (HttpException) {
      res.cookie('fortytwo_token', newUser.accessToken);
      res.redirect('http://' + process.env.SERVER_URL + ':' + process.env.SERVER_PORT +
                   '/signinFortyTwo');
    }
  }
}
