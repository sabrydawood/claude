CREATE TABLE "ConceptChunks" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"ConceptId" uuid NOT NULL,
	"Content" text NOT NULL,
	"Locale" text DEFAULT 'ar' NOT NULL,
	"EmbeddingText" text,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ConceptRelations" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"FromConceptId" uuid NOT NULL,
	"ToConceptId" uuid NOT NULL,
	"RelationType" text NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Concepts" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"NameAr" text NOT NULL,
	"NameEn" text NOT NULL,
	"Difficulty" integer DEFAULT 1 NOT NULL,
	"Type" text NOT NULL,
	"IsDeleted" boolean DEFAULT false NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "LearningSignals" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"ConceptId" uuid NOT NULL,
	"SignalType" text NOT NULL,
	"Value" integer DEFAULT 1 NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SemanticCache" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"QuestionHash" text NOT NULL,
	"Question" text NOT NULL,
	"Answer" text NOT NULL,
	"PageKey" text,
	"Locale" text DEFAULT 'ar' NOT NULL,
	"HitCount" integer DEFAULT 0 NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StudentInsights" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"Insights" text DEFAULT '{}' NOT NULL,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "StudentInsights_UserId_unique" UNIQUE("UserId")
);
--> statement-breakpoint
CREATE TABLE "StudentMastery" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"UserId" uuid NOT NULL,
	"ConceptId" uuid NOT NULL,
	"Score" integer DEFAULT 0 NOT NULL,
	"Attempts" integer DEFAULT 0 NOT NULL,
	"LastTested" timestamp with time zone,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Uniq_StudentMastery_UserConcept" UNIQUE("UserId","ConceptId")
);
--> statement-breakpoint
ALTER TABLE "ConceptChunks" ADD CONSTRAINT "ConceptChunks_ConceptId_Concepts_Id_fk" FOREIGN KEY ("ConceptId") REFERENCES "public"."Concepts"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ConceptRelations" ADD CONSTRAINT "ConceptRelations_FromConceptId_Concepts_Id_fk" FOREIGN KEY ("FromConceptId") REFERENCES "public"."Concepts"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ConceptRelations" ADD CONSTRAINT "ConceptRelations_ToConceptId_Concepts_Id_fk" FOREIGN KEY ("ToConceptId") REFERENCES "public"."Concepts"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LearningSignals" ADD CONSTRAINT "LearningSignals_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LearningSignals" ADD CONSTRAINT "LearningSignals_ConceptId_Concepts_Id_fk" FOREIGN KEY ("ConceptId") REFERENCES "public"."Concepts"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentInsights" ADD CONSTRAINT "StudentInsights_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentMastery" ADD CONSTRAINT "StudentMastery_UserId_users_id_fk" FOREIGN KEY ("UserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentMastery" ADD CONSTRAINT "StudentMastery_ConceptId_Concepts_Id_fk" FOREIGN KEY ("ConceptId") REFERENCES "public"."Concepts"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Idx_ConceptChunks_ConceptId" ON "ConceptChunks" USING btree ("ConceptId");--> statement-breakpoint
CREATE INDEX "Idx_ConceptRelations_From" ON "ConceptRelations" USING btree ("FromConceptId");--> statement-breakpoint
CREATE INDEX "Idx_ConceptRelations_To" ON "ConceptRelations" USING btree ("ToConceptId");--> statement-breakpoint
CREATE INDEX "Idx_LearningSignals_UserId" ON "LearningSignals" USING btree ("UserId");--> statement-breakpoint
CREATE INDEX "Idx_LearningSignals_ConceptId" ON "LearningSignals" USING btree ("ConceptId");--> statement-breakpoint
CREATE INDEX "Idx_SemanticCache_Hash" ON "SemanticCache" USING btree ("QuestionHash");--> statement-breakpoint
CREATE INDEX "Idx_SemanticCache_PageKey" ON "SemanticCache" USING btree ("PageKey");--> statement-breakpoint
CREATE INDEX "Idx_StudentMastery_UserId" ON "StudentMastery" USING btree ("UserId");