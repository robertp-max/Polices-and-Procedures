export interface DomainMeta {
  code: string;
  name: string;
  description: string;
  owner: string;
}

export interface SubdomainMeta {
  code: string;
  domainCode: string;
  name: string;
  description: string;
  owner: string;
  reviewCycle: string;
  tier: number;
}

export const DOMAIN_META: Record<string, DomainMeta> = {
  GV: { code: 'GV', name: 'Governance & Administration', description: 'Authority, structure, and oversight of the agency\'s governing body, administrative leadership, and organizational governance functions.', owner: 'Administrator / Governing Body' },
  CL: { code: 'CL', name: 'Clinical Operations', description: 'Clinical service delivery, patient care standards, assessment protocols, and OASIS compliance for all clinical disciplines.', owner: 'Director of Nursing / Clinical Manager' },
  QA: { code: 'QA', name: 'Quality Assurance & Performance Improvement', description: 'QAPI program governance, performance improvement projects, outcome monitoring, and quality metrics.', owner: 'QAPI Coordinator' },
  HR: { code: 'HR', name: 'Human Resources', description: 'Staff recruitment, credentialing, training, competency evaluation, and employee relations management.', owner: 'HR Director' },
  CO: { code: 'CO', name: 'Compliance & Regulatory', description: 'Corporate compliance program, HIPAA privacy and security, fraud prevention, and regulatory monitoring.', owner: 'Compliance Officer' },
  FN: { code: 'FN', name: 'Finance & Revenue Cycle', description: 'Medicare billing, PDGM coding, claims management, financial planning, and revenue cycle operations.', owner: 'CFO / Finance Director' },
  OP: { code: 'OP', name: 'Operations', description: 'Referral intake, scheduling, service delivery logistics, emergency preparedness, and operational support.', owner: 'Operations Manager' },
  IT: { code: 'IT', name: 'Technology & Information Security', description: 'Information systems, access control, data encryption, network security, and HIPAA security compliance.', owner: 'IT Director / Security Officer' },
  RM: { code: 'RM', name: 'Risk Management & Safety', description: 'Enterprise risk management, incident reporting, safety programs, and liability mitigation.', owner: 'Risk Manager / Safety Officer' },
  EN: { code: 'EN', name: 'Enterprise Control', description: 'Policy taxonomy governance, lifecycle management, cross-domain coordination, and enterprise standards.', owner: 'Policy Administrator' },
};

export const SUBDOMAIN_META: Record<string, SubdomainMeta> = {
  'GV-GA': { code: 'GA', domainCode: 'GV', name: 'Governance & Administration', description: 'Authority, composition, and oversight responsibilities of the governing body.', owner: 'Governing Body', reviewCycle: 'Annual', tier: 4 },
  'CL-CP': { code: 'CP', domainCode: 'CL', name: 'Clinical Practice', description: 'Clinical service delivery standards, patient care protocols, and clinical documentation.', owner: 'Director of Nursing', reviewCycle: 'Annual', tier: 3 },
  'CL-OA': { code: 'OA', domainCode: 'CL', name: 'OASIS & Assessment Governance', description: 'OASIS data collection, accuracy standards, and assessment protocols.', owner: 'OASIS Coordinator', reviewCycle: 'Annual', tier: 3 },
  'QA-QA': { code: 'QA', domainCode: 'QA', name: 'Quality Assurance', description: 'QAPI program, performance improvement, outcome monitoring, and quality metrics.', owner: 'QA Coordinator', reviewCycle: 'Annual', tier: 3 },
  'HR-HR': { code: 'HR', domainCode: 'HR', name: 'Human Resources', description: 'Staff management, credentialing, training, and competency programs.', owner: 'HR Director', reviewCycle: 'Annual', tier: 2 },
  'CO-CO': { code: 'CO', domainCode: 'CO', name: 'Compliance & Regulatory', description: 'Compliance program, HIPAA, fraud prevention, and regulatory monitoring.', owner: 'Compliance Officer', reviewCycle: 'Annual', tier: 4 },
  'FN-FN': { code: 'FN', domainCode: 'FN', name: 'Finance & Revenue Cycle', description: 'Billing, coding, claims, and financial operations.', owner: 'Finance Director', reviewCycle: 'Annual', tier: 2 },
  'OP-OP': { code: 'OP', domainCode: 'OP', name: 'Operations', description: 'Operational logistics, scheduling, intake, and emergency preparedness.', owner: 'Operations Manager', reviewCycle: 'Annual', tier: 2 },
  'IT-IT': { code: 'IT', domainCode: 'IT', name: 'Technology & IT Security', description: 'Information systems, cybersecurity, access control, and HIPAA security.', owner: 'IT Director', reviewCycle: 'Annual', tier: 3 },
  'RM-RM': { code: 'RM', domainCode: 'RM', name: 'Risk Management & Safety', description: 'Risk management, incident reporting, safety programs, and loss prevention.', owner: 'Risk Manager', reviewCycle: 'Biennial', tier: 2 },
  'EN-EC': { code: 'EC', domainCode: 'EN', name: 'Enterprise Control', description: 'Policy taxonomy, lifecycle management, and cross-domain governance.', owner: 'Policy Administrator', reviewCycle: 'Annual', tier: 4 },
};
