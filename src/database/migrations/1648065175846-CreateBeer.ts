import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";

export class CreateBeer1648065175846 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(new Table({
        name: "beer",
        columns: [{
          name: "id",
          type: "integer",
          isPrimary: true,
          isGenerated: true,
          generationStrategy: "increment",
        }, {
          name: "from_id",
          type: "varchar",
          isNullable: false,
        }, {
          name: "to_id",
          type: "varchar",
          isNullable: false,
        }, {
          name: "motivo",
          type: "varchar",
          isNullable: true,
        }, {
          name: "action",
          type: "varchar",
          isNullable: false,
        }, {
          name: "created_at",
          type: "timestamp",
          isNullable: false,
          default: "now()",
        }, {
          name: "updated_at",
          type: "timestamp",
          isNullable: false,
          default: "now()",
        }, {
          name: "disabled_by",
          type: "varchar",
          isNullable: true,
        }, {
          name: "disabled_reason",
          type: "varchar",
          isNullable: true,
        }, {
          name: "disabled_at",
          type: "timestamp",
          isNullable: true,
        }]
      }));

      await queryRunner.createForeignKeys("beer", [
        new TableForeignKey({
          columnNames: ["to_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "user",
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        }),
        new TableForeignKey({
          columnNames: ["from_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "user",
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        }),
        new TableForeignKey({
          columnNames: ["disabled_by"],
          referencedColumnNames: ["id"],
          referencedTableName: "user",
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        }),
      ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      const table = await queryRunner.getTable("beer");
      await queryRunner.dropForeignKeys(table.name, table.foreignKeys);
      await queryRunner.dropTable(table.name);
    }

}
