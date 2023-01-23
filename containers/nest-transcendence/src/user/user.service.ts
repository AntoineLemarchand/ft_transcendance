import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { User } from './user.entities';
import { ChannelService } from '../channel/channel.service';
import { Channel } from '../channel/channel.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ErrConflict,
  ErrForbidden,
  ErrNotFound,
  ErrUnAuthorized,
} from '../exceptions';
import { RoomHandler } from '../broadcasting/broadcasting.roomHandler';
import { GameService } from '../game/game.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => ChannelService))
    private channelService: ChannelService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => RoomHandler))
    private roomHandler: RoomHandler,
    @Inject(forwardRef(() => GameService))
    private gameService: GameService,
  ) {}

  async getUserInfo(name: string) {
    const test = await this.getUser(name);
    if (!test) return undefined;
    const { password, friends, ...userWithoutPassword } = test;
    return {
      friends: await this.getFriendUserStatus(friends),
      ...userWithoutPassword,
    };
  }

  async getUser(name: string) {
    const test = await this.userRepository.findOneBy({ name: name });
    if (!test) return undefined;
    return test;
  }

  private async getFriendUserStatus(friends: string[]) {
    const result = friends.map((friendName) => {
      return {
        username: friendName,
        status: this.getStatus(friendName),
      };
    });
    return result;
  }

  async createUser(user: User) {
    await this.userRepository.save(user);
    await this.channelService.joinChannel(user.getName(), 'welcome', '');
  }

  async deleteUser(name: string) {
    const toDelete: User | undefined = await this.getUser(name);
    if (toDelete === undefined) throw new Error('User does not exist');
    await this.userRepository.remove(toDelete);
  }

  async addFriend(username: string, friendname: string) {
    const executingUser = (await this.getUser(username)) as User;
    const friend = await this.getUser(friendname);
    if (friend === undefined) throw new ErrNotFound('Could not find user');
    try {
      executingUser.addFriend(friendname);
      await this.userRepository.save(executingUser);
    } catch (e) {
      throw new ErrUnAuthorized('is already a friend');
    }
  }

  async removeFriend(username: string, friendname: string) {
    const user = (await this.getUser(username)) as User;
    try {
      user.removeFriend(friendname);
      await this.userRepository.save(user);
    } catch (e) {
      throw new ErrNotFound('not your friend');
    }
  }

  async getChannels(username: string) {
    const user = (await this.getUser(username)) as User;
    const result: Channel[] = [];
    for (const channelName of user.getChannelNames())
      result.push(
        (await this.channelService.getChannelByName(channelName)) as Channel,
      );
    return result;
  }

  async addChannelName(username: string, channelName: string) {
    const user = await this.getUser(username);
    if (user === undefined) throw new ErrNotFound('Could not find user');
    if (user.getChannelNames().includes(channelName))
      throw new ErrConflict('user has already joined the channel');
    user.addChannelName(channelName);
    await this.userRepository.save(user);
  }

  async removeChannelName(username: string, channelName: string) {
    const user: User = (await this.getUser(username)) as User;
    user.removeChannelName(channelName);
    await this.userRepository.save(user);
  }

  async getAllUsernames() {
    const userlist = await this.userRepository.find();
    return userlist;
  }

  async findMatching(regexSearchString: string): Promise<string[]> {
    const result: string[] = [];

    for (const value of await this.getAllUsernames()) {
      const nameCandidate = await value.getName();
      if (new RegExp(regexSearchString, 'g').test(nameCandidate))
        result.push(nameCandidate);
    }
    return result;
  }

  async blockUser(username: string, userToBlock: string) {
    const executingUser = (await this.getUser(username)) as User;
    if (userToBlock === undefined) throw new ErrNotFound('Could not find user');
    try {
      executingUser.blockUser(userToBlock);
      await this.userRepository.save(executingUser);
    } catch (e) {
      throw new ErrForbidden('is already blocked');
    }
  }

  async getBlockedUsers(username: string) {
    const user = (await this.getUser(username)) as User;
    return user.getBlockedUsers();
  }

  async unblockUser(username: string, userToUnblock: string) {
    const user = (await this.getUser(username)) as User;
    user.unblockUser(userToUnblock);
    this.userRepository.save(user);
  }

  getStatus(username: string) {
    if (this.gameService.getRunningGameForUser(username)) return 'inGame';
    if (this.roomHandler.isUserOnline(username)) return 'online';
    return 'offline';
  }
}
