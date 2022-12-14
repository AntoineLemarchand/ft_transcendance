import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Channel, Message } from './channel.entities';
import { ChannelRepository } from './channel.repository.mock';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { UserService } from '../user/user.service';

@Injectable()
export class ChannelService {
  constructor(
    private channelRepository: ChannelRepository,
    private broadcastingGateway: BroadcastingGateway,
    @Inject(forwardRef(() => UserService))
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
    await this.broadcastingGateway.emitMessage(message.channel, message);
  }

  async addChannel(channelName: string, ownername: string): Promise<Channel> {
    return await this.channelRepository
      .create(channelName, ownername)
      .catch(() => {
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

  async getChannelByName(channelName: string) {
    return await this.channelRepository.findOne(channelName);
  }

  async joinChannel(
    userName: string,
    channelName: string,
    channelPassword: string,
  ): Promise<Channel> {
    const channel = await this.getChannelByName(channelName).catch(async () => {
      return await this.addChannel(channelName, userName);
    });
    if (await channel.isUserBanned(userName))
      return Promise.reject(new Error('the user is banned'));
    await this.userService.addChannelName(userName, channelName);
    this.broadcastingGateway.putUserInRoom(userName, channelName);
    return channel as Channel;
  }

  async banUserFromChannel(
    usernameOfExecutor: string,
    bannedUserName: string,
    channelName: string,
  ): Promise<void> {
    const channel: Channel = await this.channelRepository.findOne(channelName);
    if (channel.isAdmin(usernameOfExecutor) == false)
      throw new Error('This user is not an admin');
    channel.banUser(bannedUserName);
    this.userService.removeChannelName(bannedUserName, channelName)
  }
}
