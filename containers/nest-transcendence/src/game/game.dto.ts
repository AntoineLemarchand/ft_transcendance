import { IsAlphanumeric, IsNumberString, IsOptional, Length } from "class-validator";

export class GameRefDTO {
  @IsNumberString()
  @IsOptional()
  id: string;
  @IsNumberString()
  @IsOptional()
  gameId: string;
}

export class GameCreationDTO {
  @IsAlphanumeric()
  @Length(0, 15)
  player2: any;
}
