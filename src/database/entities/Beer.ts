import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Beer extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: string;

  @Column({ nullable: true })
  from_id: string;

  @Column()
  to_id: string;

  @Column("integer", { default: 0 })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
};