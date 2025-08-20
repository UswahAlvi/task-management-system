import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { Role } from '../../users/role.enum';

export class CreateCompanyInviteDto {

  @IsNotEmpty()
  @IsNumber()
  sendTo: number;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
