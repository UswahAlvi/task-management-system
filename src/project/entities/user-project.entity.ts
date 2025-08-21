import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectRoleEnum } from '../../common/enums/projectRole.enum';

@Entity()
export class UserProject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  projectId: number;

  @Column({ type: 'enum', enum: ProjectRoleEnum, nullable: false })
  role: ProjectRoleEnum;
}
