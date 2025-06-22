CREATE TYPE "public"."user_role" AS ENUM('admin', 'writer', 'producer', 'storyboard_artist', 'director', 'team_member');--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"owner_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"team_members" text[] DEFAULT '{}' NOT NULL,
	"settings" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "role" "user_role" DEFAULT 'team_member' NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "permissions" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "project_access" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "profile" json;