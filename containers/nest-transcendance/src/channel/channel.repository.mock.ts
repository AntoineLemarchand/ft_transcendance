import { Injectable } from '@nestjs/common';
import { Channel, Message } from './channel.entities';

@Injectable()
export class ChannelRepository {
  private channels = new Map<string, Channel>();

  async findAll(): Promise<Channel[]> {
    return Array.from(this.channels.values());
  }

  async findOne(channelName: string): Promise<Channel> {
    const channel = this.channels.get(channelName);
    if (!channel) return Promise.reject(new Error('No such channel'));
    return channel;
  }

  async remove(channelName: string): Promise<void> {
    this.channels.delete(channelName);
    return;
  }

  async create(channelName: string, creatorUserName: string): Promise<Channel> {
    if (this.channels.has(channelName))
      return Promise.reject(new Error('this channel exists already'));
    this.channels.set(channelName, new Channel(channelName, creatorUserName));
    return this.channels.get(channelName) as Channel;
  }

  async addMessageToChannel(
    channelName: string,
    message: Message,
  ): Promise<void> {
    const channel = await this.findOne(channelName);
    channel.addMessage(message);
    this.channels.set(channelName, channel);
  }

  async findMatching(regexSearchString: string): Promise<Channel[]> {
    const result: Channel[] = [];

    this.channels.forEach((value, key, map) => {
      if (new RegExp(regexSearchString, 'g').test(key))
        result.push(value);
    });
    return result;
  }
}
