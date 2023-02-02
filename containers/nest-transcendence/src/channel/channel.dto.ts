import {
  IsAlpha,
  IsAlphanumeric,
  IsIn,
  IsNotEmpty, IsNumber, IsNumberString,
  IsOptional,
  IsString,
  Length
} from "class-validator";

export class ChannelCreationDTO {
  @IsNotEmpty()
  @Length(1, 80)
  @IsAlphanumeric()
  @IsOptional()
  @IsString()
  channelName?: string;
  @IsIn(['directMessage', 'standardChannel', 'privateChannel'])
  @IsAlpha()
  channelType: string;
  @IsAlphanumeric()
  @Length(0, 15)
  @IsOptional()
  targetUsername?: string;
  @IsString()
  @IsOptional()
  channelPassword?: string;
}

export class ChannelRefDTO {
  @IsAlphanumeric()
  @Length(0, 80)
  channelName: string;
}

export class ChannelMuteDTO {
  @IsNotEmpty()
  @Length(1, 15)
  @IsAlphanumeric()
  @IsString()
  mutedUsername: string;
  @IsNumber()
  muteForMinutes: number;
  @IsNotEmpty()
  @Length(1, 80)
  @IsAlphanumeric()
  @IsString()
  channelName: string;
}

export class ChannelInviteDTO {
  @IsNotEmpty()
  @Length(1, 15)
  @IsAlphanumeric()
  @IsString()
  username: string;
  @IsNotEmpty()
  @Length(1, 80)
  @IsAlphanumeric()
  @IsString()
  channelName: string;
}

export class ChannelSetPwdDTO {
  @IsString()
  newPassword: string;
  @IsNotEmpty()
  @Length(1, 80)
  @IsAlphanumeric()
  @IsString()
  channelName: string;
}

export class ChannelMakeAdminDTO {
  @IsString()
  @Length(1, 15)
  @IsAlphanumeric()
  adminCandidate: string;
  @IsNotEmpty()
  @Length(1, 80)
  @IsAlphanumeric()
  @IsString()
  channelName: string;
}

export class ChannelBanDTO {
  @IsNotEmpty()
  @Length(1, 15)
  @IsAlphanumeric()
  @IsString()
  bannedUsername: string;
  @IsNotEmpty()
  @Length(1, 80)
  @IsAlphanumeric()
  @IsString()
  channelName: string;
}