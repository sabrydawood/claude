CREATE TABLE "ProviderModels" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"ProviderId" uuid NOT NULL,
	"ModelName" text NOT NULL,
	"InputCostPerM" text DEFAULT '0' NOT NULL,
	"OutputCostPerM" text DEFAULT '0' NOT NULL,
	"MaxTokens" integer DEFAULT 8192 NOT NULL,
	"IsActive" boolean DEFAULT true NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Providers" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"Name" text NOT NULL,
	"Description" text,
	"BaseUrl" text NOT NULL,
	"ApiKeyEnc" text NOT NULL,
	"IsActive" boolean DEFAULT true NOT NULL,
	"CreatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "RoutingRules" (
	"Id" uuid PRIMARY KEY NOT NULL,
	"TaskType" text NOT NULL,
	"ModelId" uuid NOT NULL,
	"Priority" integer DEFAULT 1 NOT NULL,
	"IsActive" boolean DEFAULT true NOT NULL,
	"UpdatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ProviderModels" ADD CONSTRAINT "ProviderModels_ProviderId_Providers_Id_fk" FOREIGN KEY ("ProviderId") REFERENCES "public"."Providers"("Id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "RoutingRules" ADD CONSTRAINT "RoutingRules_ModelId_ProviderModels_Id_fk" FOREIGN KEY ("ModelId") REFERENCES "public"."ProviderModels"("Id") ON DELETE cascade ON UPDATE no action;