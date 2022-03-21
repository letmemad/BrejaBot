import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class BeerMigration1647722563941 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: "beer",
        columns: [{
          name: "id",
          type: "integer",
          isPrimary: true,
          generationStrategy: "increment",
        }, {
          name: "from_id",
          type: "varchar",
          isNullable: true,
        }, {
          name: "to_id",
          type: "varchar",
          isNullable: false,
          isUnique: true,
        }, {
          name: "quantity",
          type: "integer",
          isNullable: false,
          default: 0,
        }, {
          name: "created_at",
          type: "datetime",
          isNullable: false,
          default: "CURRENT_TIMESTAMP"
        }, {
          name: "updated_at",
          type: "datetime",
          isNullable: false,
          default: "CURRENT_TIMESTAMP"
        }]
      }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable("beer");
    }

}
