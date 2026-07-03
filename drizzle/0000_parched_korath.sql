CREATE TABLE "continuous_medications" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"name" varchar(255) NOT NULL,
	"dosage" varchar(100) NOT NULL,
	"frequency" varchar(100) NOT NULL,
	"start_date" varchar(50) NOT NULL,
	"end_date" varchar(50),
	"is_active" boolean DEFAULT true,
	"notes" text,
	"side_effects" text,
	"dosage_history" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_timeline_events" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"title" varchar(255) NOT NULL,
	"date" varchar(50) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"name" varchar(255) NOT NULL,
	"crm" varchar(50),
	"uf" varchar(10),
	"specialty" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exam_orders" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"title" varchar(255) NOT NULL,
	"date" varchar(50) NOT NULL,
	"doctor_name" varchar(255),
	"notes" text,
	"pdf_storage_path" text,
	"file_type" varchar(100),
	"file_name" text,
	"is_fulfilled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medical_appointments" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"date" varchar(50) NOT NULL,
	"time" varchar(50),
	"doctor" varchar(255),
	"specialty" varchar(255),
	"location" text,
	"notes" text,
	"status" varchar(50) NOT NULL,
	"exam_category" varchar(100),
	"clinic_address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"data_exame" varchar(50),
	"categoria" varchar(100),
	"nome_exame" varchar(255),
	"resultado" text,
	"unidade" varchar(100),
	"valor_referencia" text,
	"interpretacao" varchar(100),
	"medico_solicitante" varchar(255),
	"arquivo_origem" text,
	"pdf_storage_path" text,
	"observacoes" text,
	"especialidade_medica" varchar(255),
	"grupo_sistemico" varchar(255),
	"tags" text,
	"impacto_autoimune" varchar(50),
	"is_manual_category" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_pathologies" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"user_id" varchar(128) NOT NULL,
	"condition" varchar(255) NOT NULL,
	"date_detected" varchar(50) NOT NULL,
	"status" varchar(100) NOT NULL,
	"description" text,
	"is_congenital" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "continuous_medications" ADD CONSTRAINT "continuous_medications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_timeline_events" ADD CONSTRAINT "custom_timeline_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_orders" ADD CONSTRAINT "exam_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_appointments" ADD CONSTRAINT "medical_appointments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_pathologies" ADD CONSTRAINT "user_pathologies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;