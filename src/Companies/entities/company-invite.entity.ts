import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CompanyRoleEnum } from '../../Guards/companyRole.enum';

@Entity()
export class CompanyInvite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  accepted: boolean;

  @Column({ type: 'int', nullable: false })
  companyId: number;

  @Column({ type: 'int', nullable: false })
  sendBy: number;

  @Column({ type: 'int', nullable: false })
  sendTo: number;

  @Column({ type: 'enum', enum: CompanyRoleEnum, nullable: false })
  role: CompanyRoleEnum;
}
