import {AfterLoad, BaseEntity, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";
import { Beer } from "./Beer";

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  guild_id: string;

  @Column("integer", { default: 0 })
  beer_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @AfterLoad()
  private async handleCountBeer() {
    const beers = await Beer.find({ where: { to_id: this.id } });

    let total = 0;
    for(let beer of beers) {
      if(beer.action === "DONATE") {
        total = total + 1;
      } else if(beer.action === "REMOVE") {
        total = total - 1;
      };
    };

    this.beer_count = total;
  };
};