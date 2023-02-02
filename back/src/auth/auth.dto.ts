import {
  IsAlphanumeric,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Length,
  max,
} from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(1, 15)
  username: string;
  @IsOptional()
  @IsString()
  password?: any;
  @IsOptional()
  image?: Express.Multer.File;
  @IsOptional()
  @IsString()
  accessToken?: any;
}

export class TwoFactorDTO {
  @IsString()
  code2fa: string;
}
