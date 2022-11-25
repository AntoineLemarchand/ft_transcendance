/* eslint-disable prettier/prettier */
import { Controller, Delete, Get, Post } from "@nestjs/common";
import { UserService } from './user.service';
import User from "./user.entities";

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

}
