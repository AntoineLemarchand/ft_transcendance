import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtTwoFactorGuard } from './auth/auth.2fa.guard';
import { UserService } from './user/user.service'

class RequestBody {
  readonly name: string;
}

@Controller()
export class AppController {
  @UseGuards(JwtTwoFactorGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return req.user;
  }
}
