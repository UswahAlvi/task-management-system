import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private async hashString(str: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(str, saltRounds);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user: User = new User();
    user.username = createUserDto.username;
    user.firstname = createUserDto.firstname;
    user.lastname = createUserDto.lastname;
    user.password = await this.hashString(createUserDto.password);
    return this.userRepository.save(user);
  }
  async findOne(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
  async deleteOne({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<string> {
    const user: User | null = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) return 'no such user exists';
    const isMatch: boolean = await bcrypt.compare(password, user?.password);
    if (!isMatch) {
      return 'invalid user';
    }
    await this.userRepository.delete(user?.id);
    return 'successfully deleted user';
  }
}
