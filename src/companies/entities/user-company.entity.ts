import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CompanyRoleEnum } from '../../Guards/companyRole.enum';

@Entity()
export class UserCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'int', nullable: false })
  companyId: number;

  @Column({ type: 'enum', enum: CompanyRoleEnum, nullable: false })
  role: CompanyRoleEnum;
}
