import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'node:process';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { Company } from './companies/entities/company.entity';
import { CompanyInvite } from './companies/entities/company-invite.entity';
import { UserCompany } from './companies/entities/user-company.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guard/auth.guard';
import { CompanyRolesGuard } from './common/guard/companyRoles.guard';
import { ProjectsModule } from './project/projects.module';
import { Project } from './project/entities/project.entity';
import { UserProject } from './project/entities/user-project.entity';

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
      entities: [
        User,
        Company,
        UserCompany,
        CompanyInvite,
        Project,
        UserProject,
      ],
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
    ProjectsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: CompanyRolesGuard },
  ],
})
export class AppModule {}
