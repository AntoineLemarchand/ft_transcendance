import { Channel } from '../channel/channel.entities';

export default class User {
  private friends: string[] = [];
  private blockedUsers: string[] = [];
  private channelNames: string[] = ['welcome'];
  constructor(private name: string, private password: string) {}

  getName() {
    return this.name;
  }

  getPassword() {
    return this.password;
  }

  getFriends() {
    return this.friends;
  }

  addFriend(friendname: string) {
    this.friends.forEach((name: string) => {
      if (name === friendname) throw new Error('already a friend');
    });
    this.friends.push(friendname);
  }

  removeFriend(friendname: string) {
    for (let i = 0; i < this.friends.length; i++) {
      if (this.friends[i] === friendname) {
        this.friends.splice(i);
        return;
      }
    }
    throw new Error('not your friend');
  }

  toJson(): JSON {
    return JSON.parse(JSON.stringify(this));
  }

  getChannelNames() {
    return this.channelNames;
  }

  addChannelName(channelName: string) {
    this.channelNames.push(channelName);
  }

  removeChannelName(channelName: string) {
    this.channelNames = this.channelNames.filter(
      (tmpName) => tmpName != channelName,
    );
  }
  
  getBlockedUsers() {
    return this.blockedUsers;
  }

  blockUser(username: string) {
    this.blockedUsers.forEach((name: string) => {
      // error thrown not necessary?
      if (name === username) throw new Error('already blocked');
    });
    this.blockedUsers.push(username);
  }

  unblockUser(username: string) {
    for (let i = 0; i < this.blockedUsers.length; i++) {
      if (this.blockedUsers[i] === username) {
        this.blockedUsers.splice(i);
        return;
      }
    }
  }
}
