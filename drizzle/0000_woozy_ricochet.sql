CREATE TABLE "hemu-ai-parempi_chats" (
	"chatId" serial PRIMARY KEY NOT NULL,
	"chatContent" text,
	"sender" text,
	"exerciseId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hemu-ai-parempi_exercises" (
	"exerciseId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"problemId" integer NOT NULL,
	"solveId" integer NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"exerciseName" text DEFAULT 'exercise' NOT NULL,
	"folderId" uuid,
	CONSTRAINT "hemu-ai-parempi_exercises_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "hemu-ai-parempi_problems" (
	"problemId" serial PRIMARY KEY NOT NULL,
	"problemContent" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hemu-ai-parempi_solves" (
	"solveId" serial PRIMARY KEY NOT NULL,
	"solveContent" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_chats" ADD CONSTRAINT "hemu-ai-parempi_chats_exerciseId_hemu-ai-parempi_exercises_exerciseId_fk" FOREIGN KEY ("exerciseId") REFERENCES "public"."hemu-ai-parempi_exercises"("exerciseId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_exercises" ADD CONSTRAINT "hemu-ai-parempi_exercises_problemId_hemu-ai-parempi_problems_problemId_fk" FOREIGN KEY ("problemId") REFERENCES "public"."hemu-ai-parempi_problems"("problemId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_exercises" ADD CONSTRAINT "hemu-ai-parempi_exercises_solveId_hemu-ai-parempi_solves_solveId_fk" FOREIGN KEY ("solveId") REFERENCES "public"."hemu-ai-parempi_solves"("solveId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_exercises" ADD CONSTRAINT "hemu-ai-parempi_exercises_folderId_hemu-ai-parempi_folders_folderId_fk" FOREIGN KEY ("folderId") REFERENCES "public"."hemu-ai-parempi_folders"("folderId") ON DELETE cascade ON UPDATE no action;