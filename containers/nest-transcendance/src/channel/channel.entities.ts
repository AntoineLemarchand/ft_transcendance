//todo: how to prevent duplication with react?
export class Message {
  sender: string;
  content: string;
  channel: string;
  constructor() {
    this.sender = '';
    this.channel = '';
    this.content = '';
  }
}

export class Channel {
  messages: Message[];
  private admins: string[];
  private bannedUsers: string[];

  constructor(private channelName: string,
              creatorUserName: string) {
    this.messages = [];
    this.admins = [creatorUserName];
    this.bannedUsers = [];
  }

  getAdmins(): string[] {
    return this.admins;
  }

  addMessage(message: Message) {
    this.messages.push(message);
  }

  getMessages(): Message[] {
    return this.messages;
  }

  getName(): string {
    return this.channelName;
  }

  banUser(bannedUserName: string) {
    this.bannedUsers.push(bannedUserName);
  }

  isUserBanned(userName: string) {
    return this.bannedUsers.includes(userName);
  }

  isAdmin(usernameOfExecutor: string) {
    return this.admins.includes(usernameOfExecutor);
  }
}
