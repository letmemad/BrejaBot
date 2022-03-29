import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Beer extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: string;

  @Column({ nullable: true })
  from_id: string;

  @Column()
  to_id: string;

  @Column("varchar", { nullable: true })
  motivo: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  disabled_by?: string;

  @Column({ nullable: true })
  disabled_reason?: string;

  @DeleteDateColumn({ nullable: true })
  disabled_at?: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "to_id", referencedColumnName: "id" })
  toUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "from_id", referencedColumnName: "id" })
  fromUser: User;
};