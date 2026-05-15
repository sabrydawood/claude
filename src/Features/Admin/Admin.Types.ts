/**
 * Admin.Types.ts
 */
export interface IAdminLesson {
  Id: number;
  AgentId: number;
  AgentSlug: string;
  Order: number;
  XpReward: number;
  EstimatedMinutes: number;
  TitleAr: string;
  TitleEn: string;
  DescriptionAr: string;
  DescriptionEn: string;
}
