import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  firstname: string;

  @Column({ type: 'varchar', length: 20, default: '' })
  lastname: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  password: string;
}
