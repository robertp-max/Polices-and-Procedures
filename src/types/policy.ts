export type PolicyTier = 'REQUIRED' | 'ESSENTIAL' | 'RECOMMENDED' | 'GOOD TO HAVE';

export type PolicyStatus =
  | 'Draft'
  | 'Under Review'
  | 'Revision Requested'
  | 'Approved'
  | 'Rejected'
  | 'Published'
  | 'Archived';

export type CommentStatus = 'Open' | 'Accepted' | 'Rejected' | 'Resolved';

export interface ReviewComment {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  commentText: string;
  suggestedChange: string;
  status: CommentStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface Policy {
  id: string;
  policyId: string;
  title: string;
  domain: string;
  domainCode: string;
  subdomain: string;
  subdomainCode: string;
  tier: PolicyTier;
  version: string;
  status: PolicyStatus;
  briefDescription: string;
  policyBody: string;
  procedureBody: string;
  revisionNotes: string;
  trainingContent: string;
  reviewerComments: ReviewComment[];
  lastUpdated: string;
  reviewedBy: string;
  reviewedAt: string;
  approvedBy: string;
  approvedAt: string;
  publishToScorm: boolean;
  publishToMasterFile: boolean;
  // SCORM hook placeholder
  scormPackageId?: string;
  // Google Drive export hook placeholder
  driveFileId?: string;
}

export interface DashboardStats {
  total: number;
  draft: number;
  underReview: number;
  approved: number;
  published: number;
  revisionRequested: number;
  rejected: number;
  archived: number;
  byDomain: Record<string, number>;
  byTier: Record<PolicyTier, number>;
}

export interface FilterState {
  search: string;
  domain: string;
  subdomain: string;
  tier: string;
  status: string;
}
