import { IsAlphanumeric, Length } from 'class-validator';

export class UserRefDTO {
  @IsAlphanumeric()
  @Length(0, 15)
  username: any;
}
