import {
  CanActivate, forwardRef,
  HttpException,
  HttpStatus, Inject,
  Injectable
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Observable } from 'rxjs';
import { JwtStrategy } from './auth.jwt.strategy';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const token = context.switchToWs().getClient().handshake.query.auth;
    const sender = this.jwtService.decode(token);
    if (sender === null)
      throw new WsException('not authorized');
    return sender;
  }
}
