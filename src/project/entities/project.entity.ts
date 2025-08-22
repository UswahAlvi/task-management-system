import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { UserCompany } from '../../company/entities/user-company.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true, default: '' })
  description: string;

  @ManyToOne(() => Company, (company) => company.id, {
    onDelete: 'CASCADE',
  })
  companyId: Company;

  @ManyToOne(() => UserCompany, (userCompany) => userCompany.userId, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  createdBy: UserCompany;

  @Column({ type: 'date', nullable: false, default: new Date() })
  createdAt: Date;

  @Column({ type: 'date', nullable: false, default: new Date() })
  updatedAt: Date;
}
