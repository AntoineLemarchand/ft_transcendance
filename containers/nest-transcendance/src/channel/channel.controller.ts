import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { ChannelService } from './channel.service';

@Controller()
export class ChannelController {
  constructor(private channelService: ChannelService) {
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  async addChannel(@Request() req: any) {
    await this.channelService.addChannel(req.body.channelname, req.user.name);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getChannels(@Request() req: any) {
    const allChannels = await this.channelService.getChannels();
    return {channels: JSON.stringify(allChannels)};
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async findMatching(@Request() req: any) {
    const matchingChannels = await this.channelService.findMatching(
      req.body.regexString,
    );
    return {channels: JSON.stringify(matchingChannels)};
  }
}
