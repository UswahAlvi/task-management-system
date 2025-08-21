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
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = {
      sub: user.id,
      username: user.username,
    };
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
    return {
      message: 'Login successful!',
      user: {
        id: user.id,
        username: user.username,
      },
      token: {
        accessToken: token,
        expiresIn: '7d',
      },
    };
  }
}
