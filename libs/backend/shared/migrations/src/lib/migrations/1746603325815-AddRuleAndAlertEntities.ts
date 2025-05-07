import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRuleAndAlertEntities1746603325815 implements MigrationInterface {
    name = 'AddRuleAndAlertEntities1746603325815'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "rule" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                CONSTRAINT "PK_a5577f464213af7ffbe866e3cb5" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "rule"."createdAt" IS 'Creation date';
            COMMENT ON COLUMN "rule"."updatedAt" IS 'Latest update date'
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."alert_status_enum" AS ENUM('NEW', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED')
        `);
        await queryRunner.query(`
            CREATE TABLE "alert" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "status" "public"."alert_status_enum" NOT NULL DEFAULT 'NEW',
                "metadata" jsonb,
                "rule_id" uuid NOT NULL,
                "transaction_id" uuid NOT NULL,
                CONSTRAINT "PK_ad91cad659a3536465d564a4b2f" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "alert"."createdAt" IS 'Creation date';
            COMMENT ON COLUMN "alert"."updatedAt" IS 'Latest update date'
        `);
        await queryRunner.query(`
            ALTER TABLE "alert"
            ADD CONSTRAINT "FK_e9bf555f33872d7b50eb2421a17" FOREIGN KEY ("rule_id") REFERENCES "rule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "alert"
            ADD CONSTRAINT "FK_c36c762d233311d11b4c1462f75" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "alert" DROP CONSTRAINT "FK_c36c762d233311d11b4c1462f75"
        `);
        await queryRunner.query(`
            ALTER TABLE "alert" DROP CONSTRAINT "FK_e9bf555f33872d7b50eb2421a17"
        `);
        await queryRunner.query(`
            DROP TABLE "alert"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."alert_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "rule"
        `);
    }

}
