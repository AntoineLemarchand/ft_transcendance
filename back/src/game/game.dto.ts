import { IsAlphanumeric, IsNumber, IsNumberString, IsOptional, IsString, Length } from "class-validator";

export class GameRefDTO {
  @IsNumberString()
  @IsOptional()
  id: string;
  @IsNumberString()
  @IsOptional()
  gameId: string;
}

export class GameRefParamDTO {
  @IsString()
  @IsOptional()
  id: string;
  @IsString()
  @IsOptional()
  gameId: string;
}

export class GameCreationDTO {
  @IsAlphanumeric()
  @Length(0, 15)
  player2: any;
}
