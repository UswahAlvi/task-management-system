import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async userSignIn({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) {
    const user: User | null = await this.userService.findOne(username);
    const isMatch: boolean = await bcrypt.compare(
      password,
      <string>user?.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const payload = { username: user?.username };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }
}
