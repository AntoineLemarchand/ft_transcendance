import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Channel, ChannelType, Message } from './channel.entities';
import { BroadcastingGateway } from '../broadcasting/broadcasting.gateway';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
    private broadcastingGateway: BroadcastingGateway,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async sendMessage(message: Message): Promise<void> {
    const channel = await await this.getChannelByName(message.channel);
    await channel.addMessage(message);
    await this.channelRepository.save(channel);
    //todo: find syntax to differentiate between messages and game states etc
    await this.broadcastingGateway.emitMessage(message.channel, message);
  }

  async addChannel(
    channelName: string,
    executorName: string,
    password: string,
    channelType: ChannelType,
  ): Promise<Channel> {
    const result = new Channel(
      channelName,
      executorName,
      password,
      channelType,
    );
    await this.channelRepository.save(result);
    return result;
  }

  async findMatchingNames(regexSearchString: string): Promise<string[]> {
    const matchingChannels = await this.channelRepository.findBy({
      channelName: Like(`%${regexSearchString}%`),
    });
    return await matchingChannels.map((channel) => channel.getName());
  }

  async getChannels(): Promise<Channel[]> {
    return await this.channelRepository.find();
  }

  async getChannelByName(channelName: string) {
    const result = await this.channelRepository.findOneBy({
      channelName: channelName,
    });
    if (result) return result;
    else return Promise.reject(new Error('No such channel'));
  }

  async joinChannel(
    targetUserName: string,
    channelName: string,
    channelPassword: string,
    channelType = ChannelType.Normal,
  ): Promise<Channel> {
    checkName();
    const channel = (await this.getChannelByName(channelName).catch(
      async () => {
        return await this.addChannel(
          channelName,
          targetUserName,
          channelPassword,
          channelType,
        );
      },
    )) as Channel;
    await isJoiningAllowed();
    return await this.addUserToChannel(targetUserName, channelName, channel);

    function checkName() {
      if (channelName.includes('_') && channelType != ChannelType.DirectMesage)
        throw new HttpException(
          'channelnames cannot contain underscores',
          HttpStatus.FORBIDDEN,
        );
    }
    async function isJoiningAllowed() {
      if (
        channel.getType() == ChannelType.Private &&
        targetUserName != channel.getAdmins()[0]
      )
        throw new HttpException(
          'joining a private channel is not allowed',
          HttpStatus.UNAUTHORIZED,
        );
      if (await channel.isUserBanned(targetUserName))
        throw new HttpException('the user is banned', HttpStatus.UNAUTHORIZED);
      if (
        (await channel.getPassword()) &&
        (await channel.getPassword()) != channelPassword
      )
        throw new HttpException('wrong password', HttpStatus.UNAUTHORIZED);
    }
  }

  private async addUserToChannel(
    targetUserName: string,
    channelName: string,
    channel: Channel,
  ) {
    await this.userService.addChannelName(targetUserName, channelName);
    await this.broadcastingGateway.putUserInRoom(targetUserName, channelName);
    return channel as Channel;
  }

  async banUserFromChannel(
    executorName: string,
    bannedUserName: string,
    channelName: string,
  ): Promise<void> {
    const channel: Channel = await this.getChannelByName(channelName);
    this.prohibitNonAdminAccess(
      channel,
      executorName,
      'This user is not an admin',
    );
    channel.banUser(bannedUserName);
    await this.userService.removeChannelName(bannedUserName, channelName);
  }

  async inviteToChannel(
    executorName: string,
    invitedName: string,
    channelName: string,
  ) {
    const channel = (await this.getChannelByName(channelName).catch(
      (exception) => {
        throw new HttpException(exception, HttpStatus.NOT_FOUND);
      },
    )) as Channel;
    this.prohibitNonAdminAccess(
      channel,
      executorName,
      'only admins can invite',
    );
    await this.addUserToChannel(invitedName, channelName, channel);
    await channel.unbanUser(invitedName);
  }
  async createDirectMessageChannelFor(
    executorName: string,
    invitedUsername: string,
  ) {
    const channelName = executorName + '_' + invitedUsername;
    await this.joinChannel(
      executorName,
      channelName,
      '',
      ChannelType.DirectMesage,
    );
    await this.inviteToChannel(executorName, invitedUsername, channelName);
    await this.makeAdmin(executorName, invitedUsername, channelName);
  }

  async makeAdmin(
    executorName: string,
    adminCandidateUsername: string,
    channelName: string,
  ) {
    const channel = await this.getChannelByName(channelName);
    this.prohibitNonAdminAccess(
      channel,
      executorName,
      'only admins can make other user admins',
    );
    channel.addAdmin(adminCandidateUsername);
    await this.channelRepository.save(channel);
  }

  async setPassword(
    executorName: string,
    newPassword: string,
    channelName: string,
  ) {
    const channel = await this.getChannelByName(channelName);
    this.prohibitNonAdminAccess(
      channel,
      executorName,
      'only admins can change the channel password',
    );
    channel.setPassword(newPassword);
    await this.channelRepository.save(channel);
  }

  private prohibitNonAdminAccess(
    channel: Channel,
    executor: string,
    message: string,
  ) {
    if (channel.isAdmin(executor) === false)
      throw new HttpException(message, HttpStatus.UNAUTHORIZED);
  }
}
