import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CompaniesModule } from '../companies/companies.module';
import { CompanyInvite } from '../companies/entities/company-invite.entity';
import { UserCompany } from '../companies/entities/user-company.entity';

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
