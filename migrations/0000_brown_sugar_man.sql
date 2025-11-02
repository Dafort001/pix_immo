CREATE TABLE "ai_jobs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"shoot_id" varchar NOT NULL,
	"tool" varchar(50) NOT NULL,
	"model_slug" varchar(100) NOT NULL,
	"source_image_key" text NOT NULL,
	"output_image_key" text,
	"params" text,
	"external_job_id" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"cost" bigint,
	"credits" bigint,
	"error_message" text,
	"webhook_received_at" bigint,
	"completed_at" bigint,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_items" (
	"id" varchar PRIMARY KEY NOT NULL,
	"booking_id" varchar NOT NULL,
	"service_id" varchar NOT NULL,
	"quantity" bigint DEFAULT 1 NOT NULL,
	"unit_price" bigint NOT NULL,
	"total_price" bigint NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"region" varchar(3) NOT NULL,
	"kilometers" bigint,
	"contact_name" varchar(255),
	"contact_email" varchar(255),
	"contact_mobile" varchar(50) NOT NULL,
	"property_name" varchar(255) NOT NULL,
	"property_address" text,
	"address_lat" varchar(50),
	"address_lng" varchar(50),
	"address_place_id" varchar(255),
	"address_formatted" text,
	"property_type" varchar(100),
	"preferred_date" varchar(50),
	"preferred_time" varchar(50),
	"special_requirements" text,
	"total_net_price" bigint NOT NULL,
	"vat_amount" bigint NOT NULL,
	"gross_amount" bigint NOT NULL,
	"agb_accepted" varchar(5) DEFAULT 'false' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" bigint NOT NULL,
	"confirmed_at" bigint
);
--> statement-breakpoint
CREATE TABLE "captions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"image_id" varchar NOT NULL,
	"caption_text" text NOT NULL,
	"room_type" varchar(50),
	"confidence" bigint,
	"language" varchar(10) DEFAULT 'de' NOT NULL,
	"version" bigint DEFAULT 1 NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edited_images" (
	"id" varchar PRIMARY KEY NOT NULL,
	"shoot_id" varchar NOT NULL,
	"stack_id" varchar,
	"filename" varchar(255) NOT NULL,
	"file_path" text NOT NULL,
	"file_size" bigint,
	"version" bigint DEFAULT 1 NOT NULL,
	"room_type" varchar(50),
	"sequence_index" bigint,
	"client_approval_status" varchar(20) DEFAULT 'pending' NOT NULL,
	"revision_notes" text,
	"ai_caption" text,
	"created_at" bigint NOT NULL,
	"approved_at" bigint,
	"rejected_at" bigint
);
--> statement-breakpoint
CREATE TABLE "editor_tokens" (
	"id" varchar PRIMARY KEY NOT NULL,
	"shoot_id" varchar NOT NULL,
	"token" text NOT NULL,
	"token_type" varchar(20) NOT NULL,
	"file_path" text,
	"expires_at" bigint NOT NULL,
	"created_at" bigint NOT NULL,
	"used_at" bigint,
	CONSTRAINT "editor_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "editorial_comments" (
	"id" varchar PRIMARY KEY NOT NULL,
	"item_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"comment" text NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editorial_items" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"category" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'idea' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"description" text,
	"due_date" bigint,
	"publish_week" varchar(10),
	"assignee_id" varchar,
	"tags" text[],
	"created_by" varchar NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	"completed_at" bigint
);
--> statement-breakpoint
CREATE TABLE "exposes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"job_id" varchar NOT NULL,
	"summary" text NOT NULL,
	"highlights" text,
	"neighborhood" text,
	"tech_details" text,
	"word_count" bigint,
	"version" bigint DEFAULT 1 NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "galleries" (
	"id" varchar PRIMARY KEY NOT NULL,
	"gallery_type" varchar(50) NOT NULL,
	"user_id" varchar NOT NULL,
	"shoot_id" varchar,
	"job_id" varchar,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'uploaded' NOT NULL,
	"global_style_preset" varchar(50),
	"global_window_preset" varchar(50),
	"global_sky_preset" varchar(100),
	"global_fireplace" varchar(5) DEFAULT 'false' NOT NULL,
	"global_retouch" varchar(5) DEFAULT 'true' NOT NULL,
	"global_enhancements" varchar(5) DEFAULT 'true' NOT NULL,
	"finalized_at" bigint,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_annotations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"file_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"annotation_type" varchar(50) NOT NULL,
	"comment" text,
	"mask_path" text,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_files" (
	"id" varchar PRIMARY KEY NOT NULL,
	"gallery_id" varchar NOT NULL,
	"original_filename" varchar(255) NOT NULL,
	"stored_filename" varchar(255) NOT NULL,
	"file_path" text NOT NULL,
	"thumbnail_path" text,
	"file_type" varchar(50) NOT NULL,
	"file_size" bigint,
	"room_type" varchar(50),
	"sequence_index" bigint NOT NULL,
	"style_preset" varchar(50),
	"window_preset" varchar(50),
	"sky_preset" varchar(100),
	"fireplace_enabled" varchar(5),
	"retouch_enabled" varchar(5),
	"enhancements_enabled" varchar(5),
	"status" varchar(50) DEFAULT 'uploaded' NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_comments" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"image_id" varchar NOT NULL,
	"comment" text NOT NULL,
	"alt_text" text,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_favorites" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"image_id" varchar NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" varchar PRIMARY KEY NOT NULL,
	"shoot_id" varchar NOT NULL,
	"stack_id" varchar,
	"original_filename" varchar(255) NOT NULL,
	"renamed_filename" varchar(255),
	"file_path" text NOT NULL,
	"preview_path" text,
	"file_size" bigint,
	"mime_type" varchar(100),
	"exif_date" bigint,
	"exposure_value" varchar(10),
	"position_in_stack" bigint,
	"room_type" varchar(50),
	"filename_pattern_version" varchar(10) DEFAULT 'v3.1',
	"validated_at" bigint,
	"classified_at" bigint,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" varchar PRIMARY KEY NOT NULL,
	"local_id" varchar(50),
	"job_number" varchar(50) NOT NULL,
	"user_id" varchar NOT NULL,
	"customer_name" varchar(255),
	"property_name" varchar(255) NOT NULL,
	"property_address" text,
	"address_lat" varchar(50),
	"address_lng" varchar(50),
	"address_place_id" varchar(255),
	"address_formatted" text,
	"status" varchar(50) DEFAULT 'created' NOT NULL,
	"deadline_at" bigint,
	"deliver_gallery" varchar(10) DEFAULT 'true' NOT NULL,
	"deliver_alttext" varchar(10) DEFAULT 'true' NOT NULL,
	"deliver_expose" varchar(10) DEFAULT 'false' NOT NULL,
	"selected_user_id" varchar(50),
	"selected_user_initials" varchar(10),
	"selected_user_code" varchar(20),
	"created_at" bigint NOT NULL,
	CONSTRAINT "jobs_local_id_unique" UNIQUE("local_id"),
	CONSTRAINT "jobs_job_number_unique" UNIQUE("job_number")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"property_name" varchar(255) NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(50),
	"property_address" text NOT NULL,
	"address_lat" varchar(50),
	"address_lng" varchar(50),
	"address_place_id" varchar(255),
	"address_formatted" text,
	"address_location_type" varchar(50),
	"preferred_date" varchar(50),
	"notes" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text NOT NULL,
	"expires_at" bigint NOT NULL,
	"created_at" bigint NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "personal_access_tokens" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text NOT NULL,
	"name" varchar(100),
	"scopes" text NOT NULL,
	"expires_at" bigint NOT NULL,
	"last_used_at" bigint,
	"last_used_ip" varchar(45),
	"created_at" bigint NOT NULL,
	"revoked_at" bigint,
	CONSTRAINT "personal_access_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text NOT NULL,
	"expires_at" bigint NOT NULL,
	"created_at" bigint NOT NULL,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "seo_metadata" (
	"id" varchar PRIMARY KEY NOT NULL,
	"page_path" varchar(255) NOT NULL,
	"page_title" varchar(255) NOT NULL,
	"meta_description" text NOT NULL,
	"og_image" varchar(500),
	"alt_text" text,
	"updated_at" bigint NOT NULL,
	"updated_by" varchar,
	CONSTRAINT "seo_metadata_page_path_unique" UNIQUE("page_path")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" varchar PRIMARY KEY NOT NULL,
	"service_code" varchar(10) NOT NULL,
	"category" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"net_price" bigint,
	"price_note" text,
	"notes" text,
	"is_active" varchar(5) DEFAULT 'true' NOT NULL,
	"created_at" bigint NOT NULL,
	CONSTRAINT "services_service_code_unique" UNIQUE("service_code")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"expires_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shoots" (
	"id" varchar PRIMARY KEY NOT NULL,
	"shoot_code" varchar(5) NOT NULL,
	"job_id" varchar NOT NULL,
	"status" varchar(50) DEFAULT 'initialized' NOT NULL,
	"created_at" bigint NOT NULL,
	"intake_completed_at" bigint,
	"handoff_generated_at" bigint,
	"editor_returned_at" bigint,
	CONSTRAINT "shoots_shoot_code_unique" UNIQUE("shoot_code")
);
--> statement-breakpoint
CREATE TABLE "stacks" (
	"id" varchar PRIMARY KEY NOT NULL,
	"shoot_id" varchar NOT NULL,
	"stack_number" varchar(10) NOT NULL,
	"room_type" varchar(50) DEFAULT 'undefined_space' NOT NULL,
	"frame_count" bigint DEFAULT 5 NOT NULL,
	"sequence_index" bigint NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upload_sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"shoot_id" varchar NOT NULL,
	"filename" varchar(255) NOT NULL,
	"room_type" varchar(50) NOT NULL,
	"stack_index" bigint NOT NULL,
	"stack_count" bigint NOT NULL,
	"r2_key" text NOT NULL,
	"upload_id" text NOT NULL,
	"file_size" bigint,
	"parts" text,
	"status" varchar(20) DEFAULT 'initiated' NOT NULL,
	"completed_at" bigint,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"hashed_password" text NOT NULL,
	"role" varchar(20) DEFAULT 'client' NOT NULL,
	"credits" bigint DEFAULT 0 NOT NULL,
	"stripe_customer_id" varchar(255),
	"created_at" bigint NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_jobs" ADD CONSTRAINT "ai_jobs_shoot_id_shoots_id_fk" FOREIGN KEY ("shoot_id") REFERENCES "public"."shoots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "captions" ADD CONSTRAINT "captions_image_id_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edited_images" ADD CONSTRAINT "edited_images_shoot_id_shoots_id_fk" FOREIGN KEY ("shoot_id") REFERENCES "public"."shoots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edited_images" ADD CONSTRAINT "edited_images_stack_id_stacks_id_fk" FOREIGN KEY ("stack_id") REFERENCES "public"."stacks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editor_tokens" ADD CONSTRAINT "editor_tokens_shoot_id_shoots_id_fk" FOREIGN KEY ("shoot_id") REFERENCES "public"."shoots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_comments" ADD CONSTRAINT "editorial_comments_item_id_editorial_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."editorial_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_comments" ADD CONSTRAINT "editorial_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_items" ADD CONSTRAINT "editorial_items_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "editorial_items" ADD CONSTRAINT "editorial_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exposes" ADD CONSTRAINT "exposes_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_shoot_id_shoots_id_fk" FOREIGN KEY ("shoot_id") REFERENCES "public"."shoots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "galleries" ADD CONSTRAINT "galleries_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_annotations" ADD CONSTRAINT "gallery_annotations_file_id_gallery_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."gallery_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_annotations" ADD CONSTRAINT "gallery_annotations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_files" ADD CONSTRAINT "gallery_files_gallery_id_galleries_id_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."galleries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_comments" ADD CONSTRAINT "image_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_comments" ADD CONSTRAINT "image_comments_image_id_edited_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."edited_images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_favorites" ADD CONSTRAINT "image_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_favorites" ADD CONSTRAINT "image_favorites_image_id_edited_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."edited_images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_shoot_id_shoots_id_fk" FOREIGN KEY ("shoot_id") REFERENCES "public"."shoots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_stack_id_stacks_id_fk" FOREIGN KEY ("stack_id") REFERENCES "public"."stacks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_access_tokens" ADD CONSTRAINT "personal_access_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_metadata" ADD CONSTRAINT "seo_metadata_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shoots" ADD CONSTRAINT "shoots_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stacks" ADD CONSTRAINT "stacks_shoot_id_shoots_id_fk" FOREIGN KEY ("shoot_id") REFERENCES "public"."shoots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_shoot_id_shoots_id_fk" FOREIGN KEY ("shoot_id") REFERENCES "public"."shoots"("id") ON DELETE cascade ON UPDATE no action;