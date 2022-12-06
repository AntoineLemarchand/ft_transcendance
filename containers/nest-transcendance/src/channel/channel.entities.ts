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

  constructor(private channelName: string,
              creatorUserName: string) {
    this.messages = [];
    this.admins = [creatorUserName];
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
}
