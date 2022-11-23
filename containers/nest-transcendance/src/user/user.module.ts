import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import User from './user.entities';

@Module({
  controllers: [UserController],
  imports: [User],
  providers: [UserService],
  exports: [UserService, User],
})
export class UserModule {}
