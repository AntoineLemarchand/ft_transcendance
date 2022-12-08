import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
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
    await this.channelService.addChannel(req.body.channelname, req.user.name);
  }

  @UseGuards(JwtAuthGuard)
  @Get('findAll')
  async getChannels(@Request() req: any) {
    const allChannels = await this.channelService.getChannels();
    return { channels: JSON.stringify(allChannels) };
  }

  @UseGuards(JwtAuthGuard)
  @Get('findOne')
  async getChannelByName(@Request() req: any) {
    try {
      const result = await this.channelService.getChannelByName(
        req.body.channelname,
      );
      return { channel: JSON.stringify(result) };
    } catch (e) {
      throw new HttpException(e.name, HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('getMatchingNames')
  async findMatching(@Request() req: any) {
    const matchingChannels = await this.channelService.findMatching(
      req.body.regexString,
    );
    return { channels: JSON.stringify(matchingChannels) };
  }
}
