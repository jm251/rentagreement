export type ClauseSource = "ai" | "system";

export interface ClauseInput {
  title: string;
  text: string;
}

export interface AgreementClause extends ClauseInput {
  id: string;
  source: ClauseSource;
  locked?: boolean;
}
