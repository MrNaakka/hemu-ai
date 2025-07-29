ALTER TABLE "hemu-ai-parempi_users" ALTER COLUMN "tier" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_users" ADD COLUMN "tokenLimit" integer DEFAULT 10000 NOT NULL;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_users" ADD COLUMN "usedTokens" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_users" ADD COLUMN "status" text NOT NULL;