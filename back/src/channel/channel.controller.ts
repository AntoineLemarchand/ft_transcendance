import {
  Body,
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
import { JwtTwoFactorGuard } from '../auth/auth.2fa.guard';
import { ChannelService } from './channel.service';
import {
  ChannelBanDTO,
  ChannelCreationDTO,
  ChannelInviteDTO,
  ChannelMakeAdminDTO,
  ChannelMuteDTO,
  ChannelRefDTO,
  ChannelSetPwdDTO,
} from './channel.dto';
@Controller()
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @UseGuards(JwtTwoFactorGuard)
  @Post('join')
  async addChannel(
    @Request() req: any,
    @Body() channelCreationDTO: ChannelCreationDTO,
  ) {
    if (!channelCreationDTO.channelType)
      throw new HttpException(
        'no channel type specified',
        HttpStatus.BAD_REQUEST,
      );
    if (channelCreationDTO.channelType == 'directMessage') {
      return {
        channel: await this.channelService.createDirectMessageChannelFor(
          req.user.name,
          channelCreationDTO.targetUsername as string,
        ),
      };
    }
    return {
      channel: await this.channelService.joinChannel(
        req.user.name,
        channelCreationDTO.channelName as string,
        channelCreationDTO.channelPassword as string,
        channelCreationDTO.channelType,
      ),
    };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('mute')
  async muteUserOnChannel(@Request() req: any, @Body() input: ChannelMuteDTO) {
    await this.channelService.muteMemberForMinutes(
      req.user.name,
      input.mutedUsername,
      input.muteForMinutes,
      input.channelName,
    );
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('invite')
  async inviteToChannel(@Request() req: any, @Body() input: ChannelInviteDTO) {
    await this.channelService.inviteToChannel(
      req.user.name,
      input.username,
      input.channelName,
    );
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('findAll')
  async getChannels() {
    const allChannels = await this.channelService.getChannels();
    return { channels: allChannels };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('findOne/:channelName')
  async getChannelByName(@Param() params: ChannelRefDTO) {
    try {
      const result = await this.channelService.getChannelByName(
        params.channelName,
      );
      return { channel: result };
    } catch (e) {
      throw new HttpException(e.name, HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('getMatchingNames/:channelName')
  async findMatching(@Param() params: ChannelRefDTO) {
    const matchingChannels = await this.channelService.findMatchingNames(
      params.channelName,
    );
    return { channels: matchingChannels };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('getMatchingNames')
  async findAllChannelNames(@Request() req: any) {
    const matchingChannels = await this.channelService.findMatchingNames('');
    return { channels: matchingChannels };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('password')
  async setPassword(@Request() req: any, @Body() input: ChannelSetPwdDTO) {
    await this.channelService.setPassword(
      req.user.name,
      input.newPassword,
      input.channelName,
    );
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('admin')
  async makeAdmin(@Request() req: any, @Body() input: ChannelMakeAdminDTO) {
    const matchingChannels = await this.channelService.makeAdmin(
      req.user.name,
      input.adminCandidate,
      input.channelName,
    );
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('admin')
  async getAdmins(@Request() req: any, @Body() input: ChannelRefDTO) {
    const adminList = (
      await this.channelService.getChannelByName(input.channelName)
    ).admins;
    return { adminNames: adminList };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Delete('user')
  async banUser(@Request() req: any, @Body() input: ChannelBanDTO) {
    const matchingChannel = await this.channelService.getChannelByName(
      input.channelName,
    );
    try {
      await this.channelService.banUserFromChannel(
        req.user.name,
        input.bannedUsername,
        input.channelName,
      );
    } catch (e) {
      throw new HttpException(e, HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(JwtTwoFactorGuard)
  @Delete('join')
  async leaveChannel(@Request() req: any, @Body() input: ChannelRefDTO) {
    try {
      const result = await this.channelService.getChannelByName(
        input.channelName,
      );
      await this.channelService.removeFromChannel(
        req.user.name,
        input.channelName,
      );
    } catch (e) {
      throw new HttpException(e.name, HttpStatus.UNAUTHORIZED);
    }
  }
}
