import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Priority } from '../../common/enums/priority.enum';
import { Status } from '../../common/enums/status.enum';

export class CreateTodoDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDate()
  dueDate: Date;

  @IsInt()
  priority: Priority;

  @IsEnum(Status)
  status: Status;

  @IsNumber()
  assignedTo: number;
}
