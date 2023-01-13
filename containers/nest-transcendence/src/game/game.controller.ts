import {Controller, Post, Request, UseGuards} from '@nestjs/common';
import {GameService} from "./game.service";
import {JwtAuthGuard} from "../auth/jwt.auth.guard";

@Controller()
export class GameController {
  constructor(private gameService: GameService) {
  }

  @UseGuards(JwtAuthGuard)
  @Post('init')
  async makeAdmin(@Request() req: any) {
    this.gameService.initGame(req.user.name, req.body.player2);
  }
}
