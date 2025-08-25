import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { CompanyRoleEnum } from '../../common/enums/companyRole.enum';

export class CreateCompanyInviteDto {
  @IsNotEmpty({ message: 'the sendTo attribute cannot be empty' })
  @IsNumber()
  sendTo: number;

  @IsNotEmpty()
  @IsEnum(CompanyRoleEnum)
  role: CompanyRoleEnum;
}
