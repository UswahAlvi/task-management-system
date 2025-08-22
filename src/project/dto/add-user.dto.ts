import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddUserDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
