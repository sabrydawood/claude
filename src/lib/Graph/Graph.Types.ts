/**
 * Graph.Types.ts
 * Type definitions for the Knowledge Graph layer.
 */

export interface IConceptNode {
  Id: string;
  NameAr: string;
  NameEn: string;
  Difficulty: number;
  Type: string;
  MasteryScore?: number; // student's mastery, if loaded
}

export interface IConceptEdge {
  FromConceptId: string;
  ToConceptId: string;
  RelationType: string;
}

export interface IGraphState {
  Concepts: IConceptNode[];
  Edges: IConceptEdge[];
}

export interface IStudentGraphState extends IGraphState {
  MasteryMap: Record<string, number>; // conceptId → score 0-100
}
