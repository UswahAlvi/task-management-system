import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../auth/public.decorator';
import { User } from './entities/user.entity';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Public()
  @Post('signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }
  @Post('delete')
  delete(@Body() credentials: { username: string; password: string }) {
    return this.usersService.deleteOne(credentials);
  }
  @Get()
  findAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
