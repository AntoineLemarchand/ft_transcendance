import {
  Controller,
  Delete,
  Get,
  Param,
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
  @Post('setMode')
  async setMode(@Request() req: any) {
    await this.gameService.setMode(req.user.name, parseInt(req.body.gameId));
  }

  @UseGuards(JwtAuthGuard)
  @Post('unsetMode')
  async unsetMode(@Request() req: any) {
    await this.gameService.unsetMode(req.user.name, parseInt(req.body.gameId));
  }
  
	@UseGuards(JwtAuthGuard)
  @Get('getMode/:id')
  async getMode(@Param() params: any) {
    return { games: this.gameService.getMode(parseInt(params.id)) };
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
  @Get('getById/:id')
  async getById(@Param() params: any) {
    return {
      gameInfo: await this.gameService.getInfoObject(parseInt(params.id)),
    };
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
  @Get('getSavedGamesCount')
  async getSavedGamesCount() {
    const savedGamesCount = await this.gameService.getSavedGamesCount();
    return { games: savedGamesCount };
  }

  @UseGuards(JwtAuthGuard)
  @Get('getSavedGamesByPlayer/:username')
  async getSavedGamesByPlayer(@Param() params: any) {
    const savedGamesByPlayer = await this.gameService.getSavedGamesByPlayer(
      params.username,
    );
    return { games: savedGamesByPlayer };
  }

  @UseGuards(JwtAuthGuard)
  @Get('getWonGamesByPlayer/:username')
  async getWonGamesByPlayer(@Param() params: any) {
    const wonGamesByPlayer = await this.gameService.getWonGamesByPlayer(
      params.username,
    );
    return { games: wonGamesByPlayer };
  }

  @UseGuards(JwtAuthGuard)
  @Get('getWonGamesCountByPlayer/:username')
  async getWonGamesCountByPlayer(@Param() params: any) {
    const wonGamesCountByPlayer =
      await this.gameService.getWonGamesCountByPlayer(params.username);
    return { games: wonGamesCountByPlayer };
  }

  @UseGuards(JwtAuthGuard)
  @Post('matchMaking')
  async joinMatchMaking(@Request() req: any) {
    await this.gameService.joinMatchMaking(req.user.name);
  }
}
