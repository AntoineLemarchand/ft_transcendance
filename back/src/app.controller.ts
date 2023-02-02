import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt.auth.guard';
<<<<<<< HEAD:back/src/app.controller.ts
import { UserService } from './user/user.service'

export class CreateUserDTO {
  username: string;
  password: string;
  accessToken: string;
  image?: Express.Multer.File;
}
=======
>>>>>>> origin/api:containers/nest-transcendence/src/app.controller.ts

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
