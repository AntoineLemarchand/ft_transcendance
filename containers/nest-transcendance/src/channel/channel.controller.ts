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
import { ChannelType } from './channel.entities';

@Controller()
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @UseGuards(JwtAuthGuard)
  @Post('join')
  async addChannel(@Request() req: any) {
    let channelType = ChannelType.Normal;
    if (req.body.channelType && req.body.channelType == ChannelType.Private)
      channelType = ChannelType.Private;
    return {
      channel: await this.channelService.joinChannel(
        req.user.name,
        req.body.channelName,
        req.body.channelPassword,
        channelType,
      ),
    };
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
    const matchingChannels = await this.channelService.findMatching(
      params.regexString,
    );
    return { channels: matchingChannels };
  }

  @UseGuards(JwtAuthGuard)
  @Get('getMatchingNames')
  async findAllChannelNames(@Request() req: any) {
    const matchingChannels = await this.channelService.findMatching('');
    return { channels: matchingChannels };
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
        req.body.bannedUserName,
        req.body.channelName,
      );
    } catch (e) {
      throw new HttpException(e, HttpStatus.UNAUTHORIZED);
    }
  }
}
