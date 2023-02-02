import {
  IsAlphanumeric,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  max,
} from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(1, 15)
  username: string;
  @IsNotEmpty()
  password: string;
  image?: Express.Multer.File;
}

export class TwoFactorDTO {
  @IsString()
  code2fa: string;
}
