import {
  CanActivate,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Observable } from 'rxjs';
import { JwtStrategy } from './auth.jwt.strategy';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
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
  //   const bearerToken =
  //     context.args[0].handshake.headers.authorization.split(' ')[1];
  //   try {
  //     const decoded = jwt.verify(
  //       bearerToken,
  //       environment.JWT_SECRET_PASSWORD,
  //     ) as any;
  //     return new Promise((resolve, reject) => {
  //       const user = this.userService.getUser(decoded.username);
  //       if (user === undefined)
  //         throw new HttpException('not authorized', HttpStatus.UNAUTHORIZED);
  //       return user;
  //     });
  //   } catch (ex) {
  //     console.log(ex);
  //     return false;
  //   }
  // }
}
