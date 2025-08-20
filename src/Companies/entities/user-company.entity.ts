import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../users/role.enum';

@Entity()
export class UserCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  companyId: number;

  @Column({ type: 'enum', enum: Role, nullable: false })
  role: Role;
}
