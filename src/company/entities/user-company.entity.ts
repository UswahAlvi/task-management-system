import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CompanyRoleEnum } from '../../common/enums/companyRole.enum';
import { User } from '../../user/entities/user.entity';
import { Company } from './company.entity';

@Entity()
export class UserCompany {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  userId: User;

  @ManyToOne(() => Company, (company) => company.id, {
    onDelete: 'CASCADE',
  })
  companyId: Company;

  @Column({ type: 'enum', enum: CompanyRoleEnum, nullable: false })
  role: CompanyRoleEnum;
}
