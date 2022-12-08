import {
  Controller,
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
    await this.channelService.joinChannel(
      req.user.name,
      req.body.channelName,
      req.body.channelPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('findAll')
  async getChannels() {
    const allChannels = await this.channelService.getChannels();
    return { channels: JSON.stringify(allChannels) };
  }

  @UseGuards(JwtAuthGuard)
  @Get('findOne/:channelname')
  async getChannelByName(@Param() params: any) {
    try {
      const result = await this.channelService.getChannelByName(
        params.channelname,
      );
      return { channel: JSON.stringify(result) };
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
    return { channels: JSON.stringify(matchingChannels) };
  }
}
