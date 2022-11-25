/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import User from './user.entities';

@Injectable()
export class UserService {
  users: User[] = [new User('Thomas', 'test')];

  getUser(name: string): User | undefined {
    for (const user of this.users) {
      if (user.getName() === name)
        return user;
    }
		return undefined;
  }

  createUser(user: User) {
    this.users.push(user);
  }

  deleteUser(name: string) {
    const toDelete: User | undefined = this.users.find(
      (user) => user.getName() == name
    );
    if (toDelete == undefined)
      throw new Error('User does not exist');
    const userIndex: number = this.users.indexOf(toDelete);
    this.users.splice(userIndex, 1);
  }
}
