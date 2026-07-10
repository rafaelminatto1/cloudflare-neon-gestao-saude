ALTER TABLE "continuous_medications" ADD COLUMN "scientific_references" json;--> statement-breakpoint
ALTER TABLE "medical_records" ADD COLUMN "scientific_references" json;--> statement-breakpoint
ALTER TABLE "medical_records" ADD COLUMN "cid10_codes" json;--> statement-breakpoint
ALTER TABLE "user_pathologies" ADD COLUMN "scientific_references" json;