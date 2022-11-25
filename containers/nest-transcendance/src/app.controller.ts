import { Body, Controller, Get, Post, Delete, Request, UseGuards } from '@nestjs/common';
import { HttpException, HttpStatus} from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService, Identity } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt.auth.guard';
import { UserService } from './user/user.service'

export class CreateUserDTO {
  username: string;
  password: string;
}

@Controller()
export class AppController {
  constructor(private authService: AuthService, private userService: UserService ) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req: Express.Request): Promise<{ access_token: string }> {
    return this.authService.login(req.user as Identity);
  }

  @Post('auth/signin')
  async signin(@Body() userCandidate: CreateUserDTO) {
    const token = this.authService.createUser(userCandidate);
    return token;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('friend')
  async addFriend(@Request() req: any) {
    this.userService.addFriend(req.user.name, req.body.username);
		return req.username + ' is now your friend';
  }

  @UseGuards(JwtAuthGuard)
  @Get('friend')
  async getFriends(@Request() req: any) {
		return {friends: JSON.stringify(this.userService.getFriends(req.user.name))};
  }

  @UseGuards(JwtAuthGuard)
  @Delete('friend')
  async removeFriend(@Request() req: any) {
		this.userService.removeFriend(req.user.name, req.body.username)
		return req.username + ' is no longer your friend';
  }
}
