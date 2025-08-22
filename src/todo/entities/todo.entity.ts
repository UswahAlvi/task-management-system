import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Status } from '../../common/enums/status.enum';
import { UserCompany } from '../../company/entities/user-company.entity';
import { TaskList } from '../../tasklist/entities/tasklist.entity';
import { Priority } from '../../common/enums/priority.enum';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string;

  @Column({ type: 'enum', enum: Status, default: Status.pending })
  status: Status;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'enum', enum: Priority, nullable: false })
  priority: Priority;

  @ManyToOne(() => TaskList, (tasklist) => tasklist.id, {
    onDelete: 'CASCADE',
  })
  tasklist: TaskList;

  @ManyToOne(() => UserCompany, (userCompany) => userCompany.userId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  assignedTo: UserCompany;
}
