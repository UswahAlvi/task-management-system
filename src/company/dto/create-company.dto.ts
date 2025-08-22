import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Company name must be at most 50 characters' })
  companyName: string;
}
