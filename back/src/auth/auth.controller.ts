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
  Header,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { Oauth2Guard } from './Oauth2.guard';
import { AuthService, Identity } from './auth.service';
import { Response as ExpressResponse } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './jwt.auth.guard';
import { JwtTwoFactorGuard } from './auth.2fa.guard';
import * as qrCode from 'qrcode';
import { CreateUserDTO, TwoFactorDTO } from './auth.dto';

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
    res.cookie('token', { access_token: token, sameSite: 'strict' });
    return token;
  }

  @Post('signin')
  @UseInterceptors(FileInterceptor('image'))
  async signin(
    @Body() userCandidate: CreateUserDTO,
    @UploadedFile() image: Express.Multer.File,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    if (image) userCandidate.image = image;
    const token = await this.authService.createUser(userCandidate);
    return token;
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/activate')
  @Header('content-type', 'image/png')
  async activate2fa(
    @Request() req: any, @Res() res: ExpressResponse,
  ) {
    const otpAuthUrl = await
      this.authService.activate2fa(req.user.name, req.user.accessToken);
    res.send(await this.authService.qrCodeStreamPipe(otpAuthUrl));
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('2fa/deactivate')
  async deactivate2fa(@Request() req: any) {
    await this.authService.deactivate2fa(req.user.name);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/login')
  async login2fa(
    @Request() req: any,
    @Res({ passthrough: true }) res: ExpressResponse,
    @Body() userInput: TwoFactorDTO,
  ) {
    const token = await this.authService.logIn2fa(
      req.user.name,
      userInput.code2fa,
    );
    //res.cookie('token', { access_token: token, sameSite: 'strict' });
    return token;
  }

  @UseGuards(JwtAuthGuard)
  @Get('2fa/status')
  async get2faStatus(@Request() req: any) {
    return { status:
      await this.authService.isUserUsing2fa(req.user.name, req.user.accessToken) };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('2fa/test')
  async test2fa() {
    return { res: true };
  }

  @Get('oauth/callback')
  @UseGuards(Oauth2Guard)
  async callbackFortyTwo(
    @Request() req: Express.Request,
    @Res() res: ExpressResponse,
  ) {
    console.log(req.user);
    const newUser = req.user as Identity;
    try {
      await this.authService.validateUser(newUser.name, '', newUser.accessToken);
      const { access_token: token } = await this.authService.login(newUser);
      res.cookie('auth', token);
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
