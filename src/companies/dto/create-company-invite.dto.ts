import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { CompanyRoleEnum } from '../../Guards/companyRole.enum';

export class CreateCompanyInviteDto {
  @IsNotEmpty()
  @IsNumber()
  sendTo: number;

  @IsNotEmpty()
  @IsEnum(CompanyRoleEnum)
  role: CompanyRoleEnum;
}
