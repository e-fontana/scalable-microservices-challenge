CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'cancelled');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"create_at" timestamp DEFAULT now()
);
