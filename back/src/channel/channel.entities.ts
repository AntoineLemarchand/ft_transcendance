import { Column, Entity, PrimaryColumn } from 'typeorm';

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

// weird behavior in typeorm makes it impossible to store a map
export class MapReplacement {
  static get(arr: (string | number)[][], username: string) {
    for (const element of arr) {
      if (element[0] === username) return element[1];
    }
    return undefined;
  }

  static set(arr: (string | number)[][], username: string, value: number) {
    for (const element of arr) {
      if (element[0] === username) {
        element[1] = value;
        return arr;
      }
    }
    arr.push([username, value]);
    return arr;
  }
}

@Entity()
export class Channel {
  @Column('jsonb')
  public messages: Message[];
  @Column('text', { array: true })
  public admins: string[];
  @Column('text', { array: true })
  public bannedUsers: string[];
  @PrimaryColumn()
  public channelName: string;
  @Column({
    nullable: false,
    default: '',
    type: 'varchar',
  })
  public password = '';
  @Column({
    type: 'varchar',
  })
  public type: string;
  @Column({
    type: 'jsonb',
    array: false,
  })
  mutedUsers: (string | number)[][];

  constructor(
    channelName: string,
    creatorUsername: string,
    password = '',
    type = 'standardChannel',
  ) {
    this.type = type;
    this.password = password;
    this.channelName = channelName;
    this.messages = [];
    this.admins = [creatorUsername];
    this.bannedUsers = [];
    this.mutedUsers = [];
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

  banUser(bannedUsername: string) {
    this.bannedUsers.push(bannedUsername);
  }

  isUserBanned(username: string) {
    return this.bannedUsers.includes(username);
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

  setPassword(newPassword: string) {
    this.password = newPassword;
  }

  muteUser(username: string, forMinutes: number) {
    this.mutedUsers = MapReplacement.set(
      this.mutedUsers,
      username,
      Date.now() + forMinutes * 1000 * 60,
    );
  }

  isUserMuted(username: string) {
    return (
      (MapReplacement.get(this.mutedUsers, username) as number) > Date.now()
    );
  }
}
