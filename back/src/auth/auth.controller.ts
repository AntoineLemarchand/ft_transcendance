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
    // STEP 4: USER CREATION 
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
    if (newUser.accessToken) {
      // STEP 2.1 SET COOKIES WITH 42API TOKEN
      // STEP 2.2: USER REDIRECTION TO USERNAME PROMPT
      res.cookie('fortytwo_token', newUser.accessToken);
      res.redirect('http://' + process.env.SERVER_URL + ':' + process.env.SERVER_PORT +
                   '/signinFortyTwo');
    }
    else {
      const { access_token: token } = await this.authService.login(req.user as Identity);
      const userInfo = this.authService.getUserInfo(req.user as Identity);
      res.cookie('auth', token);
      res.cookie('userInfo', userInfo);
      res.redirect('http://' + process.env.SERVER_URL + ':' + process.env.SERVER_PORT + '/home');
      return token;
    }
  }
}
