import React from 'react';
import type { PolicyTier, PolicyStatus } from '../types/policy';

const TIER_STYLES: Record<PolicyTier, string> = {
  'REQUIRED':     'bg-[#C74600]/10 text-[#C74600] border border-[#C74600]/20',
  'ESSENTIAL':    'bg-[#007970]/10 text-[#007970] border border-[#007970]/20',
  'RECOMMENDED':  'bg-[#008540]/10 text-[#008540] border border-[#008540]/20',
  'GOOD TO HAVE': 'bg-gray-100 text-gray-500 border border-gray-200',
};

const STATUS_STYLES: Record<PolicyStatus, string> = {
  'Draft':              'bg-gray-100 text-gray-600 border border-gray-200',
  'Under Review':       'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'Revision Requested': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Approved':           'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Rejected':           'bg-red-50 text-red-700 border border-red-200',
  'Published':          'bg-[#007970]/10 text-[#007970] border border-[#007970]/20',
  'Archived':           'bg-gray-50 text-gray-400 border border-gray-200',
};

export function TierBadge({ tier }: { tier: PolicyTier }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${TIER_STYLES[tier]}`}>
      {tier}
    </span>
  );
}

export function StatusBadge({ status }: { status: PolicyStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}
