import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GameService } from './game.service';
import { JwtTwoFactorGuard } from '../auth/auth.2fa.guard';
import { UserRefDTO } from '../user/user.dto';
import { GameCreationDTO, GameRefDTO, GameRefParamDTO } from "./game.dto";

@Controller()
export class GameController {
  constructor(private gameService: GameService) {}

  @UseGuards(JwtTwoFactorGuard)
  @Post('init')
  async createGame(@Request() req: any, @Body() input: GameCreationDTO) {
    return {
      gameObject: await this.gameService.initGame(
        req.user.name,
        input.player2,
      ),
    };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('setMode')
  async setMode(@Request() req: any, @Body() input: GameRefDTO) {
    await this.gameService.setMode(req.user.name, parseInt(input.gameId));
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('unsetMode')
  async unsetMode(@Request() req: any, @Body() input: GameRefDTO) {
    await this.gameService.unsetMode(req.user.name, parseInt(input.gameId));
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('getMode/:id')
  async getMode(@Param() params: GameRefParamDTO) {
    return { games: this.gameService.getMode(parseInt(params.id)) };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('setReady')
  async setReady(@Request() req: any, @Body() input: GameRefDTO) {
    await this.gameService.setReady(req.user.name, parseInt(input.gameId));
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('spectate')
  async beginSpectating(@Request() req: any, @Body() input: GameRefDTO) {
    await this.gameService.beginSpectate(req.user.name, parseInt(input.gameId));
  }

  @UseGuards(JwtTwoFactorGuard)
  @Delete('spectate')
  async endSpectating(@Request() req: any, @Body() input: GameRefDTO) {
    await this.gameService.endSpectate(req.user.name, parseInt(input.gameId));
  }

  @UseGuards(JwtTwoFactorGuard)
  @Delete('setReady')
  async unsetReady(@Request() req: any, @Body() input: GameRefDTO) {
    await this.gameService.unsetReady(req.user.name, parseInt(input.gameId));
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('getRunning')
  async getRunning() {
    return { games: this.gameService.getRunningGames() };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('getById/:id')
  async getById(@Param() params: GameRefParamDTO) {
    return {
      gameInfo: await this.gameService.getInfoObject(parseInt(params.id)),
    };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('getPerUser')
  async getPerUser(@Request() req: any) {
    return { games: this.gameService.getGamesForUser(req.user.name) };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('getSavedGames')
  async getSavedGames() {
    const allSavedGames = await this.gameService.getSavedGames();
    return { games: allSavedGames };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('getSavedGamesCount')
  async getSavedGamesCount() {
    const savedGamesCount = await this.gameService.getSavedGamesCount();
    return { games: savedGamesCount };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('getSavedGamesByPlayer/:username')
  async getSavedGamesByPlayer(@Param() params: UserRefDTO) {
    const savedGamesByPlayer = await this.gameService.getSavedGamesByPlayer(
      params.username,
    );
    return { games: savedGamesByPlayer };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('getWonGamesByPlayer/:username')
  async getWonGamesByPlayer(@Param() params: UserRefDTO) {
    const wonGamesByPlayer = await this.gameService.getWonGamesByPlayer(
      params.username,
    );
    return { games: wonGamesByPlayer };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('getWonGamesCountByPlayer/:username')
  async getWonGamesCountByPlayer(@Param() params: UserRefDTO) {
    const wonGamesCountByPlayer =
      await this.gameService.getWonGamesCountByPlayer(params.username);
    return { games: wonGamesCountByPlayer };
  }

  @UseGuards(JwtTwoFactorGuard)
  @Post('matchMaking')
  async joinMatchMaking(@Request() req: any) {
    await this.gameService.joinMatchMaking(req.user.name);
  }
}
