import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { UserProject } from './entities/user-project.entity';
import { UserCompany } from '../companies/entities/user-company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, UserProject, UserCompany])],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
