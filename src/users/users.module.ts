import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CompaniesModule } from '../Companies/companies.module';
import { CompanyInvite } from '../Companies/entities/company-invite.entity';
import { UserCompany } from '../Companies/entities/user-company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, CompanyInvite, UserCompany]),
    CompaniesModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
