import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateUser1648064878420 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: "user",
        columns: [{
          name: "id",
          type: "varchar",
          isPrimary: true,
        }, {
          name: "guild_id",
          type: "varchar",
          isNullable: false,
        },{
          name: "beer_count",
          type: "integer",
          isNullable: false,
          default: 0,
        }, {
          name: "created_at",
          type: "date",
          isNullable: false,
          default: "now()"
        }, {
          name: "updated_at",
          type: "date",
          isNullable: false,
          default: "now()"
        }]
      }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable("user");
    }

}
