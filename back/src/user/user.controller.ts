import {
  Controller,
  Delete,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
  Param,
  HttpException,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRefDTO } from './user.dto';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Post('friend')
  async addFriend(@Request() req: any, @Body() userReference: UserRefDTO) {
    await this.userService.addFriend(req.user.name, userReference.username);
    return req.username + ' is now your friend';
  }

  @UseGuards(JwtAuthGuard)
  @Delete('friend')
  async removeFriend(@Request() req: any, @Body() userReference: UserRefDTO) {
    await this.userService.removeFriend(req.user.name, userReference.username);
    return req.username + ' is no longer your friend';
  }

  @UseGuards(JwtAuthGuard)
  @Get('info/:username')
  async getInfo(@Param() params: UserRefDTO) {
    const result = await this.userService.getUserInfo(params.username);
    if (result === undefined)
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);
    return { userInfo: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('info')
  async getInfoAboutSelf(@Request() req: any) {
    const result = await this.userService.getUserInfo(req.user.name, req.user.accessToken);
    if (result === undefined)
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);
    return { userInfo: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('image/:username')
  async getImage(@Param() params: UserRefDTO, @Res() res: any): Promise<void> {
    const result = await this.userService.getUserInfo(params.username);
    if (!result)
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);
    res.contentType(result.imageFormat);
    res.send(result.image);
  }

  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async setImage(
    @Request() req: any,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const result = await this.userService.setImage(req.user.name, image);
  }

  @UseGuards(JwtAuthGuard)
  @Get('channels')
  async getChannels(@Request() req: any) {
    return { channels: await this.userService.getChannels(req.user.name) };
  }

  @UseGuards(JwtAuthGuard)
  @Get('getMatchingNames/:username')
  async findMatching(@Param() params: UserRefDTO) {
    const matchingUsernames = await this.userService.findMatching(
      params.username,
    );
    return { usernames: matchingUsernames };
  }

  @UseGuards(JwtAuthGuard)
  @Get('getMatchingNames')
  async findAllUsernames() {
    const matchingUsernames = await this.userService.findMatching('');
    return { usernames: matchingUsernames };
  }

  @UseGuards(JwtAuthGuard)
  @Post('blockedUser')
  async blockUser(@Request() req: any, @Body() userReference: UserRefDTO) {
    await this.userService.blockUser(req.user.name, userReference.username);
    return req.username + ' is now blocked';
  }

  @UseGuards(JwtAuthGuard)
  @Get('blockedUser')
  async getBlockedUsers(@Request() req: any) {
    return {
      blockedUsers: await this.userService.getBlockedUsers(req.user.name),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('blockedUser')
  async unblockUser(@Request() req: any, @Body() userReference: UserRefDTO) {
    await this.userService.unblockUser(req.user.name, userReference.username);
    return req.username + ' is no longer blocked';
  }
}
