/* eslint-disable prettier/prettier */
import {
    Controller,
    Delete,
    Get,
    Post,
    Request,
    UseGuards,
    Param,
} from '@nestjs/common';
import {UserService} from './user.service';
import {JwtAuthGuard} from '../auth/jwt.auth.guard';

@Controller()
export class UserController {
    constructor(private userService: UserService) {
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

    @UseGuards(JwtAuthGuard)
    @Get('info/:username')
    async getInfo(@Param('username') username: string) {
        return {userInfo: this.userService.getInfo(username)};
    }

    @UseGuards(JwtAuthGuard)
    @Get('channels')
    async getChannels(@Request() req: any) {
        return {channels: await this.userService.getChannels(req.user.name)};
    }
}
