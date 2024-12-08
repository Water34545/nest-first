import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { NotFoundException } from '@nestjs/common';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        const user = {
          id,
          email: 'test@test.ru',
          password: 'password',
        } as User;
        return Promise.resolve(user);
      },
      find: (email: string) => {
        const user = { id: 1, email, password: 'password' } as User;
        return Promise.resolve([user]);
      },
      // find: (email: string) => {
      //   return Promise.resolve({ id: 1, email, password: 'password' } as User);
      // },
      // remoove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      // signup: () => {},
      signin: (email, password) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers return a list of users with given email', async () => {
    const email = 'test@test.ru';
    const users = await controller.findAllUsers(email);

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual(email);
  });

  it('findOne returns a single user with the given id', async () => {
    const id = '1';
    const user = await controller.findUser(id);

    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session and returns user', async () => {
    const sessinon = { userId: -10 };
    const user = await controller.signin(
      { email: 'test@test.tu', password: 'password' },
      sessinon,
    );

    expect(user.id).toEqual(1);
    expect(sessinon.userId).toEqual(1);
  });
});
