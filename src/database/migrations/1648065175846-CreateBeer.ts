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
          default: "DONATE",
        }, {
          name: "created_at",
          type: "date",
          isNullable: false,
          default: "CURRENT_TIMESTAMP",
        }, {
          name: "updated_at",
          type: "date",
          isNullable: false,
          default: "CURRENT_TIMESTAMP",
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
      ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      const table = await queryRunner.getTable("beer");
      await queryRunner.dropForeignKeys(table.name, table.foreignKeys);
      await queryRunner.dropTable(table.name);
    }

}
