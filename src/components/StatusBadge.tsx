import React from 'react';
import type { PolicyTier, PolicyStatus } from '../types/policy';

const TIER_STYLES: Record<PolicyTier, string> = {
  'REQUIRED':     'bg-[#FF5A1F]/20 text-[#FF9A6C] border border-[#FF5A1F]/30',
  'ESSENTIAL':    'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30',
  'RECOMMENDED':  'bg-purple-500/15 text-purple-300 border border-purple-500/30',
  'GOOD TO HAVE': 'bg-white/10 text-white/50 border border-white/20',
};

const STATUS_STYLES: Record<PolicyStatus, string> = {
  'Draft':              'bg-white/10 text-white/60 border border-white/20',
  'Under Review':       'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  'Revision Requested': 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  'Approved':           'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  'Rejected':           'bg-red-500/20 text-red-300 border border-red-500/30',
  'Published':          'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40',
  'Archived':           'bg-white/5 text-white/30 border border-white/10',
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
