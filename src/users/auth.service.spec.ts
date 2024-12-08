import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthService } from './auth.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('check hashing password', async () => {
    const data = { email: 'test@test.ru', password: 'blahblah' };
    const user = await service.signup(data.email, data.password);
    const [salt, hash] = user.password.split('.');

    expect(user.password).not.toEqual(data.password);
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdf@asdf.com', 'asdf');
    await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(
      service.signin('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('laskdjf@alskdfj.com', 'password');
    await expect(
      service.signin('laskdjf@alskdfj.com', 'laksdlfkj'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns a user of correct password is provided', async () => {
    const testUser = {
      email: 'laskdjf@alskdfj.com',
      password: 'passowrd',
    } as User;
    await service.signup(testUser.email, testUser.password);
    const user = await service.signin(testUser.email, testUser.password);

    expect(service.signin(user.email, user.password)).toBeDefined();
  });
});
