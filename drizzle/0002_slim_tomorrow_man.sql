CREATE TABLE "ConversationMessages" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"ConversationId" uuid NOT NULL,
	"Role" text NOT NULL,
	"Content" text NOT NULL,
	"Provider" text,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Conversations" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"Source" text NOT NULL,
	"Route" text,
	"Title" text,
	"IsDeleted" boolean DEFAULT false NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ConversationMessages" ADD CONSTRAINT "ConversationMessages_ConversationId_Conversations_Id_fk" FOREIGN KEY ("ConversationId") REFERENCES "public"."Conversations"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Conversations" ADD CONSTRAINT "Conversations_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Idx_ConvMsg_ConvId" ON "ConversationMessages" USING btree ("ConversationId");--> statement-breakpoint
CREATE INDEX "Idx_Conversations_UserId_Source" ON "Conversations" USING btree ("UserId","Source");--> statement-breakpoint
CREATE INDEX "Idx_Conversations_UserId_Route" ON "Conversations" USING btree ("UserId","Route");