import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCompanyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Company name must be at most 50 characters' })
  companyName: string;
}
