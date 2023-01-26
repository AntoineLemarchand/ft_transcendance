import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import User from './user.entities';
import { ChannelModule } from '../channel/channel.module';

@Module({
  controllers: [UserController],
  imports: [User, forwardRef(() => ChannelModule)],
  providers: [UserService],
  exports: [UserService, User],
})
export class UserModule {}
