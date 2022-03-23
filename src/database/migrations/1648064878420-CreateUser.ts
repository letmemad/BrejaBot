import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateUser1648064878420 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: "user",
        columns: [{
          name: "id",
          type: "varchar",
          isPrimary: true,
          isNullable: false,
          isUnique: true,
          isGenerated: false,
        }, {
          name: "guild_id",
          type: "varchar",
          isNullable: false,
        }, {
          name: "created_at",
          type: "date",
          isNullable: false,
          default: "CURRENT_TIMESTAMP"
        }, {
          name: "updated_at",
          type: "date",
          isNullable: false,
          default: "CURRENT_TIMESTAMP"
        }]
      }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable("user");
    }

}
