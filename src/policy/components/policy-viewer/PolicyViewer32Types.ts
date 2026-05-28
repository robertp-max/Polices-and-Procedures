import type { FormRecord } from '@/policy/data/formsLibraryDataset';

export type PolicyViewer32TabId =
  | 'overview'
  | 'statements'
  | 'procedures'
  | 'documentation'
  | 'compliance'
  | 'references'
  | 'appendices';

export interface PolicyViewer32Section {
  id: string;
  title: string;
  body: string;
  order: number;
}

export interface PolicyViewer32Metadata {
  id: string;
  title: string;
  domain: string;
  subdomain: string;
  tier: string;
  status: string;
  approvedBy: string;
  supersedes: string;
  effectiveDate: string;
  lastReviewed: string;
  nextReview: string;
  version: string;
  owner: string;
  reviewCycle: string;
}

export interface PolicyViewer32Model {
  metadata: PolicyViewer32Metadata;
  purpose: PolicyViewer32Section[];
  scope: PolicyViewer32Section[];
  definitions: PolicyViewer32Section[];
  statements: PolicyViewer32Section[];
  procedures: PolicyViewer32Section[];
  documentation: PolicyViewer32Section[];
  compliance: PolicyViewer32Section[];
  references: PolicyViewer32Section[];
  appendices: PolicyViewer32Section[];
  forms: FormRecord[];
  allSections: PolicyViewer32Section[];
  missingContent: boolean;
}
