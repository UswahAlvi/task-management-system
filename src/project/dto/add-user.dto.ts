import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ProjectRoleEnum } from '../../common/enums/projectRole.enum';

export class AddUserDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsEnum(ProjectRoleEnum)
  role: ProjectRoleEnum;
}
