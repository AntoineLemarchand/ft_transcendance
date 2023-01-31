import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { ChannelService } from './channel.service';
@Controller()
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @UseGuards(JwtAuthGuard)
  @Post('join')
  async addChannel(@Request() req: any) {
    if (!req.body.channelType)
      throw new HttpException(
        'no channel type specified',
        HttpStatus.BAD_REQUEST,
      );
    if (req.body.channelType == 'directMessage') {
      return {
        channel: await this.channelService.createDirectMessageChannelFor(
          req.user.name,
          req.body.targetUsername,
        ),
      };
    }
    return {
      channel: await this.channelService.joinChannel(
        req.user.name,
        req.body.channelName,
        req.body.channelPassword,
        req.body.channelType,
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('mute')
  async muteUserOnChannel(@Request() req: any) {
    await this.channelService.muteMemberForMinutes(
      req.user.name,
      req.body.mutedUsername,
      req.body.muteForMinutes,
      req.body.channelName,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('invite')
  async inviteToChannel(@Request() req: any) {
    await this.channelService.inviteToChannel(
      req.user.name,
      req.body.username,
      req.body.channelName,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('findAll')
  async getChannels() {
    const allChannels = await this.channelService.getChannels();
    return { channels: allChannels };
  }

  @UseGuards(JwtAuthGuard)
  @Get('findOne/:channelName')
  async getChannelByName(@Param() params: any) {
    try {
      const result = await this.channelService.getChannelByName(
        params.channelName,
      );
      return { channel: result };
    } catch (e) {
      throw new HttpException(e.name, HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('getMatchingNames/:regexString')
  async findMatching(@Param() params: any) {
    const matchingChannels = await this.channelService.findMatchingNames(
      params.regexString,
    );
    return { channels: matchingChannels };
  }

  @UseGuards(JwtAuthGuard)
  @Get('getMatchingNames')
  async findAllChannelNames(@Request() req: any) {
    const matchingChannels = await this.channelService.findMatchingNames('');
    return { channels: matchingChannels };
  }

  @UseGuards(JwtAuthGuard)
  @Post('password')
  async setPassword(@Request() req: any) {
    await this.channelService.setPassword(
      req.user.name,
      req.body.newPassword,
      req.body.channelName,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async makeAdmin(@Request() req: any) {
    const matchingChannels = await this.channelService.makeAdmin(
      req.user.name,
      req.body.adminCandidateName,
      req.body.channelName,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getAdmins(@Request() req: any) {
    const adminList = (
      await this.channelService.getChannelByName(req.body.channelName)
    ).admins;
    return { adminNames: adminList };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user')
  async banUser(@Request() req: any) {
    const matchingChannel = await this.channelService.getChannelByName(
      req.body.channelName,
    );
    try {
      await this.channelService.banUserFromChannel(
        req.user.name,
        req.body.bannedUsername,
        req.body.channelName,
      );
    } catch (e) {
      throw new HttpException(e, HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('join')
  async leaveChannel(@Request() req: any) {
    console.log(req.user.name);
    console.log(req.body.channelName);
    try {
      const result = await this.channelService.getChannelByName(
        req.body.channelName,
      );
      if (result.isOwner(req.user.name))
        throw new HttpException("this user is the owner", HttpStatus.UNAUTHORIZED);
      await this.channelService.removeFromChannel(req.user.name, req.body.channelName);
    } catch (e) {
      throw new HttpException(e.name, HttpStatus.UNAUTHORIZED);
    }
  }
}
