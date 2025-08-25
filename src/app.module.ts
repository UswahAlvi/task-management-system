import { Module } from '@nestjs/common';
import { UsersModule } from './user/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'node:process';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './company/companies.module';
import { Company } from './company/entities/company.entity';
import { CompanyInvite } from './company/entities/company-invite.entity';
import { UserCompany } from './company/entities/user-company.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guard/auth.guard';
import { CompanyRolesGuard } from './common/guard/companyRoles.guard';
import { ProjectsModule } from './project/projects.module';
import { Project } from './project/entities/project.entity';
import { ProjectEditor } from './project/entities/project-editor.entity';
import { User } from './user/entities/user.entity';
import { TasklistsModule } from './tasklist/tasklists.module';
import { TaskList } from './tasklist/entities/tasklist.entity';
import { TodosModule } from './todo/todos.module';
import { Todo } from './todo/entities/todo.entity';
import { ProjectRolesGuard } from './common/guard/projectRoles.guard';
import { CommentModule } from './comment/comment.module';
import { Comment } from './comment/entities/comment.entity';

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
        ProjectEditor,
        TaskList,
        Todo,
        Comment,
      ],
      synchronize: true,
      logging: false,
    }),
    UsersModule,
    AuthModule,
    CompaniesModule,
    ProjectsModule,
    TasklistsModule,
    TodosModule,
    CommentModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: CompanyRolesGuard },
    { provide: APP_GUARD, useClass: ProjectRolesGuard },
  ],
})
export class AppModule {}
