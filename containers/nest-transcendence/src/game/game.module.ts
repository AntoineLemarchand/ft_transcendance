import { forwardRef, Module } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { BroadcastingModule } from '../broadcasting/broadcasting.module';
import {GameObjectRepository} from "./game.currentGames.repository";
import { GameController } from './game.controller';

@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [GameService, GameObjectRepository],
  controllers: [GameController],
})
export class GameModule {}
