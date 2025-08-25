import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserCompany } from '../../company/entities/user-company.entity';
import { Todo } from '../../todo/entities/todo.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  commentedAt: Date;

  @Column({ nullable: true })
  editedAt: Date;

  @ManyToOne(() => UserCompany, (userCompany) => userCompany.userId, {
    onDelete: 'CASCADE',
  })
  author: UserCompany;

  @ManyToOne(() => Todo, (todo) => todo.id, {
    onDelete: 'CASCADE',
  })
  todo: Todo;
}
