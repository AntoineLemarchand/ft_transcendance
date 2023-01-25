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
  @Get('getSavedGames')
  async getSavedGames() {
    const allSavedGames = await this.gameService.getSavedGames();
    return { games: allSavedGames };
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('getSavedGameById')
  async getSavedGameById() {
    const savedGame = await this.gameService.getSavedGameById();
    return { games: savedGame };
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('getSavedGamesCount')
  async getSavedGamesCount() {
    const savedGamesCount = await this.gameService.getSavedGamesCount();
    return { games: savedGamesCount };
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('getSavedGamesByPlayer')
  async getSavedGamesByPlayer() {
    const savedGamesByPlayer = await this.gameService.getSavedGamesByPlayer();
    return { games: savedGamesByPlayer };
  }
  
  @UseGuards(JwtAuthGuard)
  @Get('getWonGamesByPlayer')
  async getWonGamesByPlayer() {
    const wonGamesByPlayer = await this.gameService.getWonGamesByPlayer();
    return { games: wonGamesByPlayer };
  }

  @UseGuards(JwtAuthGuard)
  @Post('matchMaking')
  async joinMatchMaking(@Request() req: any) {
    await this.gameService.joinMatchMaking(req.user.name);
  }
}
