import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CompanyRoleEnum } from '../../common/enums/companyRole.enum';
import { Company } from './company.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class CompanyInvite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  accepted: boolean;

  @ManyToOne(() => Company, (company) => company.id, {
    onDelete: 'CASCADE',
  })
  companyId: Company;

  @ManyToOne(() => User, (user) => user.id,{
    onDelete: 'SET NULL',
    nullable: true,
  })
  sendBy: User;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  sendTo: User;

  @Column({ type: 'enum', enum: CompanyRoleEnum, nullable: false })
  role: CompanyRoleEnum;
}
