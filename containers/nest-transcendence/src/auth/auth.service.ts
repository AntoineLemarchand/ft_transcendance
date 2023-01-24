import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entities';
import { CreateUserDTO } from '../app.controller';
import { ErrForbidden, ErrUnAuthorized } from '../exceptions';

export class Identity {
  constructor(public name: string, public id: number) {}
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.getUser(username);

    if (user !== undefined) {
      if (user.getPassword() === password) return user;
      throw new ErrUnAuthorized('Wrong password');
    }
    throw new ErrUnAuthorized('Could not find user');
  }

  async login(user: Identity) {
    const payload = { user };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createUser(userCandidate: CreateUserDTO) {
    const user = await this.userService.getUser(userCandidate.username);
    if (user !== undefined) throw new ErrUnAuthorized('User already exists');
    if (userCandidate.username.includes('_'))
      throw new ErrForbidden('no underscores in usernames');
    const newUser: User = new User(
      userCandidate.username,
      userCandidate.password,
    );
    if (userCandidate.image) {
      newUser.image = userCandidate.image.buffer;
      newUser.imageFormat = userCandidate.image.mimetype;
    }
    await this.userService.createUser(newUser);
    return this.login(new Identity(userCandidate.username, 1));
  }
}
