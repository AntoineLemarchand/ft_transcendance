import {
  Controller,
  Delete,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';

@Controller()
export class GameController {
  constructor(private gameService: GameService) {}

  @UseGuards(JwtAuthGuard)
  @Post('init')
  async createGame(@Request() req: any) {
    return {
      gameObject: await this.gameService.initGame(
        req.user.name,
        req.body.player2,
      ),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('setReady')
  async setReady(@Request() req: any) {
    await this.gameService.setReady(req.user.name, parseInt(req.body.gameId));
  }

  @UseGuards(JwtAuthGuard)
  @Post('spectate')
  async beginSpectating(@Request() req: any) {
    await this.gameService.beginSpectate(req.user.name, req.body.gameId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('spectate')
  async endSpectating(@Request() req: any) {
    await this.gameService.endSpectate(req.user.name, req.body.gameId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('setReady')
  async unsetReady(@Request() req: any) {
    await this.gameService.unsetReady(req.user.name, parseInt(req.body.gameId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('getRunning')
  async getRunning() {
    return { games: this.gameService.getRunningGames() };
  }

  @UseGuards(JwtAuthGuard)
  @Get('getPerUser')
  async getPerUser(@Request() req: any) {
    return { games: this.gameService.getGamesForUser(req.user.name) };
  }

  @UseGuards(JwtAuthGuard)
  @Post('matchMaking')
  async joinMatchMaking(@Request() req: any) {
    await this.gameService.joinMatchMaking(req.user.name);
  }
}
