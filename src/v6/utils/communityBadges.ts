/**
 * Phase 1 lightweight badge / commendation model (positive only).
 *
 * Sources must be real:
 * - journey_completion
 * - thread_helpful (accepted answer or manual mark)
 * - peer_commendation (user initiated, admin reviewable)
 * - admin_award
 *
 * Rules enforced here:
 * - Positive only. No clinical ranking, patient outcomes, deficiencies, PHI.
 * - User can hide from public profile (per-profile opt-out flag, local for Phase1).
 * - Admin review path stubbed (future).
 * - Auditable source required.
 */

import { scanForPhi, type PhiScanResult } from '@/policy/help-center/threads/threadPhiGuard';

export type BadgeSource = 'journey_completion' | 'thread_helpful' | 'peer_commendation' | 'admin_award';

export interface CommunityBadge {
  id: string;
  label: string;
  source: BadgeSource;
  awardedAt: string;
  awardedBy?: string; // display or id
  detail?: string;
  hidden?: boolean; // user opt-out for public display
}

const BADGE_STORAGE_KEY = 'community-badges-v1';
const HIDE_STORAGE_KEY = 'community-badges-hidden-v1';

function loadBadges(): Record<string, CommunityBadge[]> {
  try {
    const raw = localStorage.getItem(BADGE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveBadges(map: Record<string, CommunityBadge[]>) {
  try {
    localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

function loadHidden(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(HIDE_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveHidden(map: Record<string, string[]>) {
  try {
    localStorage.setItem(HIDE_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

/** Get badges for a user. Filters hidden for public views. */
export function getUserBadges(userId: string, viewerIsOwnerOrAdmin: boolean): CommunityBadge[] {
  const all = loadBadges()[userId] || [];
  if (viewerIsOwnerOrAdmin) return all;
  const hidden = new Set(loadHidden()[userId] || []);
  return all.filter((b) => !b.hidden && !hidden.has(b.id));
}

/** Add a badge (real source only). For demo / admin flows. */
export function awardBadge(userId: string, badge: Omit<CommunityBadge, 'id' | 'awardedAt'>) {
  const map = loadBadges();
  const list = map[userId] || [];
  const newBadge: CommunityBadge = {
    ...badge,
    id: `badge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    awardedAt: new Date().toISOString(),
  };
  map[userId] = [...list, newBadge];
  saveBadges(map);
}

/** Toggle hide for owner. */
export function setBadgeHidden(userId: string, badgeId: string, hidden: boolean) {
  const map = loadHidden();
  const list = new Set(map[userId] || []);
  if (hidden) list.add(badgeId);
  else list.delete(badgeId);
  map[userId] = Array.from(list);
  saveHidden(map);
}

/** Remove (admin / moderation). */
export function removeBadge(userId: string, badgeId: string) {
  const map = loadBadges();
  if (map[userId]) {
    map[userId] = map[userId].filter((b) => b.id !== badgeId);
    saveBadges(map);
  }
}

/** Example positive-only badge catalog (labels only). */
export const BADGE_LABELS: Record<string, string> = {
  'helpful-answer': 'Helpful Answer',
  'clinical-mentor': 'Clinical Mentor',
  'journey-champion': 'Journey Champion',
  'onboarding-supporter': 'Onboarding Supporter',
  'community-contributor': 'Community Contributor',
  'policy-guide': 'Policy Guide',
  'safety-advocate': 'Safety Advocate',
};

export const BADGES_TODO = 'Phase 1: model + adapter + empty states. Full peer commend UI + admin review + thread helpful marking are next.';

export type CommendationCategory =
  | 'Helpful teammate'
  | 'Clinical support'
  | 'Onboarding support'
  | 'QAPI support'
  | 'Policy guidance'
  | 'Safety mindset'
  | 'Great documentation help'
  | 'Positive attitude';

export interface CommunityCommendation {
  id: string;
  recipientUserId: string;
  recipientDisplayName: string;
  senderUserId: string;
  senderDisplayName: string;
  message: string;
  category: CommendationCategory;
  createdAt: string;
  status: 'pending' | 'approved' | 'hidden' | 'removed';
  source: 'peer_commendation';
}

const COMMEND_STORAGE_KEY = 'community-commendations-v1';

function loadCommendations(): Record<string, CommunityCommendation[]> {
  try {
    const raw = localStorage.getItem(COMMEND_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCommendations(map: Record<string, CommunityCommendation[]>) {
  try {
    localStorage.setItem(COMMEND_STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

/** Give a positive commendation. Uses the same full threadPhiGuard as threads for PHI detection. */
export function giveCommendation(
  recipient: { userId: string; displayName: string },
  sender: { userId: string; displayName: string },
  message: string,
  category: CommendationCategory
): { ok: boolean; reason?: string; phi?: PhiScanResult; commendation?: CommunityCommendation } {
  const trimmed = message.trim();
  if (!trimmed) return { ok: false, reason: 'empty' };

  const phiResult = scanForPhi(trimmed);
  if (phiResult.hasPhi) {
    return { ok: false, reason: 'phi', phi: phiResult };
  }

  const map = loadCommendations();
  const list = map[recipient.userId] || [];
  const comm: CommunityCommendation = {
    id: `comm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    recipientUserId: recipient.userId,
    recipientDisplayName: recipient.displayName,
    senderUserId: sender.userId,
    senderDisplayName: sender.displayName,
    message: trimmed,
    category,
    createdAt: new Date().toISOString(),
    status: 'pending', // PHASE 9: pending for admin review by default; positive only, pre-scanned via scanForPhi
    source: 'peer_commendation',
  };
  map[recipient.userId] = [...list, comm];
  saveCommendations(map);

  // Auto-award a corresponding badge
  awardBadge(recipient.userId, {
    label: 'Peer Commendation',
    source: 'peer_commendation',
    detail: `${category} from ${sender.displayName}`,
  });

  return { ok: true, commendation: comm };
}

/** Get commendations for a user. Public viewers see only approved non-hidden. */
export function getCommendations(recipientUserId: string, viewerIsOwnerOrAdmin: boolean): CommunityCommendation[] {
  const all = loadCommendations()[recipientUserId] || [];
  if (viewerIsOwnerOrAdmin) return all.filter(c => c.status !== 'removed');
  return all.filter(c => c.status === 'approved');
}

/** Admin/moderation: change status. */
export function setCommendationStatus(recipientUserId: string, commId: string, status: CommunityCommendation['status']) {
  const map = loadCommendations();
  const list = map[recipientUserId] || [];
  map[recipientUserId] = list.map(c => c.id === commId ? { ...c, status } : c);
  saveCommendations(map);
}

/** Simple PHI check for composers (re-export style). */
export function hasPossiblePhi(text: string): boolean {
  return scanForPhi(text).hasPhi;
}

export const COMMEND_CATEGORIES: CommendationCategory[] = [
  'Helpful teammate', 'Clinical support', 'Onboarding support', 'QAPI support',
  'Policy guidance', 'Safety mindset', 'Great documentation help', 'Positive attitude'
];
