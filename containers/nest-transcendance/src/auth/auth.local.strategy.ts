import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

export class Identity {
  constructor(public name: string, public id: number) {}
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<Identity> {
    const user = await this.authService.validateUser(username, password);
    if (!user)
      throw new UnauthorizedException();
    return new Identity(user.getName(), 999);
  }
}
