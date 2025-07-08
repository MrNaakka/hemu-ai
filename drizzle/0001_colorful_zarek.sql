CREATE TABLE "hemu-ai-parempi_custom_message" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"userId" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hemu-ai-parempi_folders" (
	"folderId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"folderName" text DEFAULT 'folder' NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_exercises" DROP CONSTRAINT "hemu-ai-parempi_exercises_userId_unique";--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_chats" DROP CONSTRAINT "hemu-ai-parempi_chats_exerciseId_hemu-ai-parempi_exercises_exerciseId_fk";
--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_exercises" DROP CONSTRAINT "hemu-ai-parempi_exercises_problemId_hemu-ai-parempi_problems_problemId_fk";
--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_exercises" DROP CONSTRAINT "hemu-ai-parempi_exercises_solveId_hemu-ai-parempi_solves_solveId_fk";
--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_chats" ALTER COLUMN "chatContent" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_chats" ALTER COLUMN "sender" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_problems" ALTER COLUMN "problemContent" SET DEFAULT '{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": []
    }
  ]
}';--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_solves" ALTER COLUMN "solveContent" SET DEFAULT '{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": []
    }
  ]
}';--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_problems" ADD COLUMN "exerciseId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_solves" ADD COLUMN "exerciseId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_chats" ADD CONSTRAINT "hemu-ai-parempi_chats_exerciseId_hemu-ai-parempi_exercises_exerciseId_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."hemu-ai-parempi_exercises"("exerciseId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_problems" ADD CONSTRAINT "hemu-ai-parempi_problems_exerciseId_hemu-ai-parempi_exercises_exerciseId_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."hemu-ai-parempi_exercises"("exerciseId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_solves" ADD CONSTRAINT "hemu-ai-parempi_solves_exerciseId_hemu-ai-parempi_exercises_exerciseId_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."hemu-ai-parempi_exercises"("exerciseId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_exercises" DROP COLUMN "problemId";--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_exercises" DROP COLUMN "solveId";--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_problems" ADD CONSTRAINT "hemu-ai-parempi_problems_exerciseId_unique" UNIQUE("exerciseId");--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_solves" ADD CONSTRAINT "hemu-ai-parempi_solves_exerciseId_unique" UNIQUE("exerciseId");