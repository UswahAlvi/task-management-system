import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
} from 'class-validator';
import { Priority } from '../../common/enums/priority.enum';
import { Status } from '../../common/enums/status.enum';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsNumber()
  assignedTo: number;
}
