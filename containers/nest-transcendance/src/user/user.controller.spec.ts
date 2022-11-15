import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
jest.mock('./user.service');

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call the service method when calling the get method', () => {
    controller.getUser('test');

    expect(service.getUser).toHaveBeenCalled();
  });

  it('should call deleteUser on service', () => {
    controller.deleteUser('test');

    expect(service.deleteUser).toHaveBeenCalled();
  });

  it('should call createUser on service', () => {
    controller.createUser('test');

    expect(service.createUser).toHaveBeenCalled();
  });
});
