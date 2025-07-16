CREATE TABLE "hemu-ai-parempi_users" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"tier" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_custom_message" ADD CONSTRAINT "hemu-ai-parempi_custom_message_userId_hemu-ai-parempi_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."hemu-ai-parempi_users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_exercises" ADD CONSTRAINT "hemu-ai-parempi_exercises_userId_hemu-ai-parempi_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."hemu-ai-parempi_users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hemu-ai-parempi_folders" ADD CONSTRAINT "hemu-ai-parempi_folders_userId_hemu-ai-parempi_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."hemu-ai-parempi_users"("userId") ON DELETE cascade ON UPDATE no action;