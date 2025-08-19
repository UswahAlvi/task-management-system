import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const passwordRegEx =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]{8,20}$/;

export class CreateUserDto {
  @IsString()
  @MinLength(4, { message: 'Username must be at least 4 characters' })
  @MaxLength(20, { message: 'Username must be at least 8 characters' })
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(2, { message: 'Firstname must be at least 2 characters' })
  @MaxLength(20, { message: 'Firstname must be at most 20 characters' })
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @MinLength(2, { message: 'Lastname must be at least 2 characters' })
  @MaxLength(20, { message: 'Lastname must be at most 20 characters' })
  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  @Matches(passwordRegEx, {
    message: `Password must contain Minimum 8 and maximum 20 characters, 
    at least one uppercase letter, 
    one lowercase letter, 
    one number and 
    one special character`,
  })
  password: string;
}
