import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { SigninDto } from './dto/signin.dto';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  signIn(@Body() signInDto: SigninDto) {
    return this.authService.userSignIn(signInDto);
  }
}
