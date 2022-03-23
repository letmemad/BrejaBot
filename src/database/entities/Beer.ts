import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Beer extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: string;

  @Column({ nullable: true })
  from_id: string;

  @Column()
  to_id: string;

  @Column()
  action: "DONATE" | "REMOVE";

  @Column("varchar")
  motivo: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "to_id", referencedColumnName: "id" })
  toUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "from_id", referencedColumnName: "id" })
  fromUser: User;
};