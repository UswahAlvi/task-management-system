import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectRoleEnum } from '../../common/enums/projectRole.enum';
import { UserCompany } from '../../company/entities/user-company.entity';
import { Project } from './project.entity';

@Entity()
export class ProjectEditor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserCompany, (userCompany) => userCompany.userId, {
    onDelete: 'CASCADE',
  })
  userId: UserCompany;

  @ManyToOne(() => Project, (project) => project.id, {
    onDelete: 'CASCADE',
  })
  projectId: Project;

  @Column({ type: 'enum', enum: ProjectRoleEnum, nullable: false })
  role: ProjectRoleEnum;
}
