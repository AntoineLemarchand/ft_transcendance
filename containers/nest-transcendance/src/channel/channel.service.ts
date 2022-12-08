import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Channel, Message } from './channel.entities';
import { ChannelRepository } from './channel.repository.mock';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { UserService } from '../user/user.service';

@Injectable()
export class ChannelService {
  constructor(
    private channelRepository: ChannelRepository,
    private broadcastingGateway: BroadcastingGateway,
    private userService: UserService,
  ) {}
  async sendMessage(message: Message): Promise<void> {
    await this.channelRepository
      .findOne(message.channel)
      .then((channel) => {
        channel.addMessage(message);
      })
      .catch(async () => {
        const newChannel = await this.channelRepository.create(
          message.channel,
          message.sender,
        );
        newChannel.addMessage(message);
      });
    //todo: find syntax to differentiate between messages and game states etc
    await this.broadcastingGateway.emitMessage('', message);
  }

  async addChannel(channelname: string, ownername: string): Promise<void> {
    await this.channelRepository.create(channelname, ownername).catch(() => {
      throw new HttpException(
        'This channel exists already',
        HttpStatus.UNAUTHORIZED,
      );
    });
  }

  async findMatching(regexSearchString: string): Promise<string[]> {
    return await this.channelRepository.findMatching(regexSearchString);
  }

  async getChannels(): Promise<Channel[]> {
    return await this.channelRepository.findAll();
  }

  async getChannelByName(channelname: string) {
    return await this.channelRepository.findOne(channelname);
  }

  async joinChannel(
    userName: string,
    channelName: string,
    channelPassword: string,
  ) {
    await this.getChannelByName(channelName).catch(
      async () => await this.addChannel(channelName, userName),
    );
    await this.userService.addChannelname(userName, channelName);
  }
}
