import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ChannelModule } from '../channel/channel.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => ChannelModule),
    forwardRef(() => AuthModule),
  ],
})
export class BroadcastingModule {}
