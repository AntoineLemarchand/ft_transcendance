import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './user.entities';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw On getUser when user not found', () => {
    expect(() => {
      service.getUser('name');
    }).toThrow();
  });

  it('should return a user by name', () => {
    const user: User = new User('userName');
    service.createUser(user);

    const result: User = service.getUser('userName');

    expect(result.getName()).toBe('userName');
  });

  it('should throw after deleting user and then trying to get it by name', () => {
    const user: User = new User('userName');
    service.createUser(user);

    service.deleteUser('userName');
    expect(() => {
      service.getUser('userName');
    }).toThrow();
  });

  it('should throw if deleting a non existing user', () => {
    expect(() => {
      service.deleteUser('notUserName');
    }).toThrow();
  });
});
