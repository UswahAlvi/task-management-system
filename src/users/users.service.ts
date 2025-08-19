import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  createUser(createUserDto: CreateUserDto): Promise<User> {
    const user: User = new User();
    user.username = createUserDto.username;
    user.firstname = createUserDto.firstname;
    user.lastname = createUserDto.lastname;
    user.password = createUserDto.password;
    return this.userRepository.save(user);
  }
  loginUser({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<User[]> {
    return this.userRepository.find({
      where: {
        username,
        password,
      },
    });
  }
}
