/* eslint-disable prettier/prettier */
import { Controller, Delete, Get, Post } from "@nestjs/common";
import { UserService } from './user.service';
import User from "./user.entities";

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  getUser(name: string): JSON {
    try {
      return this.userService.getUser(name).toJson();
    }
    catch (e){
      return <JSON>{};
    }
  }

  @Delete()
  deleteUser(name: string) {
    this.userService.deleteUser(name);
  }

  @Post()
  createUser(name: string) {
    this.userService.createUser(new User(name));
  }
}
