import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'node:process';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './Companies/companies.module';
import { Company } from './Companies/entities/company.entity';
import { CompanyInvite } from './Companies/entities/company-invite.entity';
import { UserCompany } from './Companies/entities/user-company.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './Guards/auth.guard';
import { CompanyRolesGuard } from './Guards/companyRoles.guard';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST,
      port: parseInt(process.env.PORT!) || 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Company, UserCompany, CompanyInvite],
      synchronize: true,
      logging: false,
    }),
    // JwtModule.register({
    //   global: true,
    //   secret: jwtConstants.secret,
    //   signOptions: {
    //     expiresIn: '7d',
    //   },
    // }),
    UsersModule,
    AuthModule,
    CompaniesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: CompanyRolesGuard },
  ],
})
export class AppModule {}
