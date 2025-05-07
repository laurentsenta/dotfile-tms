import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTransactionModel1746599019507 implements MigrationInterface {
    name = 'Migrations1746599019507'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "source_account"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "target_account"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "externalId"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "external_id" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "UQ_ac0bd0472185d24febbcc8c8e84" UNIQUE ("external_id")
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN "transaction"."external_id" IS 'Unique ID in the customer system, recommend using uuid'
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "date" TIMESTAMP WITH TIME ZONE NOT NULL
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN "transaction"."date" IS 'Date of the transaction in customer system'
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "source_account_key" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "target_account_key" character varying
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."transaction_type_enum" AS ENUM('CREDIT', 'DEBIT', 'TRANSFER')
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "type" "public"."transaction_type_enum" NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "processedAt" TIMESTAMP WITH TIME ZONE
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ALTER COLUMN "metadata" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD CONSTRAINT "CHK_36bce304f0fb07fb6f643b2971" CHECK (amount > 0)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "CHK_36bce304f0fb07fb6f643b2971"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ALTER COLUMN "metadata"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "processedAt"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "type"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."transaction_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "target_account_key"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "source_account_key"
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN "transaction"."date" IS 'Date of the transaction in customer system'
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "date"
        `);
        await queryRunner.query(`
            COMMENT ON COLUMN "transaction"."external_id" IS 'Unique ID in the customer system, recommend using uuid'
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP CONSTRAINT "UQ_ac0bd0472185d24febbcc8c8e84"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction" DROP COLUMN "external_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "externalId" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "target_account" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "transaction"
            ADD "source_account" character varying NOT NULL
        `);
    }

}
