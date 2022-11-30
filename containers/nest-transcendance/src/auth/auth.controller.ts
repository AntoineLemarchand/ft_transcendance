import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService, Identity } from './auth.service';
import { CreateUserDTO } from '../app.controller';
import { AuthModule} from './auth.module';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Express.Request): Promise<{ access_token: string }> {
    return this.authService.login(req.user as Identity);
  }

  @Post('signin')
  async signin(@Body() userCandidate: CreateUserDTO) {
    const token = this.authService.createUser(userCandidate);
    return token;
  }
}
