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

export enum ChannelType {
  Normal,
  Private,
  DirectMesage,
}

export class Channel {
  messages: Message[];
  private admins: string[];
  private bannedUsers: string[];

  constructor(
    private channelName: string,
    creatorUserName: string,
    private password = '',
    private type = ChannelType.Normal,
  ) {
    this.messages = [];
    this.admins = [creatorUserName];
    this.bannedUsers = [];
  }

  getPassword(): string {
    return this.password;
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

  getType() {
    return this.type;
  }

  unbanUser(username: string) {
    this.bannedUsers = this.bannedUsers.filter(
      (tmpUsername) => tmpUsername != username,
    );
  }

  addAdmin(adminCandidateUsername: string) {
    this.admins.push(adminCandidateUsername);
  }
}
