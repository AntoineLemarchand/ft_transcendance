import { Body, Controller, Get, Post, Delete, Request, UseGuards } from '@nestjs/common';
import { HttpException, HttpStatus} from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { Identity } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt.auth.guard';
import { UserService } from './user/user.service'

export class CreateUserDTO {
  username: string;
  password: string;
}

class RequestBody {
	readonly name: string;
}

@Controller()
export class AppController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return req.user;
  }
}
