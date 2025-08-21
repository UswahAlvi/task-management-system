import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true, default: '' })
  description: string;

  @Column({ type: 'int', nullable: false })
  companyId: number;

  @Column({ type: 'int', nullable: false })
  createdBy: number;

  @Column({ type: 'date', nullable: false, default: new Date() })
  createdAt: Date;

  @Column({ type: 'date', nullable: false, default: new Date() })
  updatedAt: Date;
}
