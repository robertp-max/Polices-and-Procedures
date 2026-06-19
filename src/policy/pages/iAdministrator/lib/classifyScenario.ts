import { COMPLIANCE_ACTION_MAP, type ComplianceScenarioId } from './complianceActionMap';

export interface ScenarioClassification {
  scenarioId: ComplianceScenarioId;
  matchedKeywords: string[];
  matchedTriggerTerms: string[];
  matchedEmergencyTriggers: string[];
  matchedEscalationTriggers: string[];
  excludedByTerms: string[];
  emergencyTriggerExplanation: string | null;
  confidence: 'high' | 'medium' | 'low';
  score: number;
}

function normalize(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s/.-]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function classifyScenario(input: string): ScenarioClassification | null {
  const normalized = normalize(input);
  if (!normalized) return null;

  // Human-first distress router (before app data / corpus) — staff safety / boundary / allegation cases
  const distress = detectFieldStaffDistress(normalized);
  if (distress) {
    return {
      scenarioId: distress.id as any,
      matchedKeywords: distress.keywords,
      matchedTriggerTerms: distress.keywords,
      matchedEmergencyTriggers: distress.id === 'active_life_threat' ? distress.keywords : [],
      matchedEscalationTriggers: distress.keywords,
      excludedByTerms: [],
      emergencyTriggerExplanation: distress.id.includes('life') || distress.id.includes('assault') || distress.id.includes('boundary') ? 'Field staff safety / distress — human supervisor response required first.' : null,
      score: 12,
      confidence: 'high',
    };
  }

  let bestMatch: ScenarioClassification | null = null;

  const rules = Object.values(COMPLIANCE_ACTION_MAP);
  for (const rule of rules) {
    const matchedTriggerTerms = rule.triggerTerms.filter(keyword => normalized.includes(keyword));
    const matchedEmergencyTriggers = rule.emergencyTriggers.filter(keyword => normalized.includes(keyword));
    const matchedEscalationTriggers = rule.escalationTriggers.filter(keyword => normalized.includes(keyword));
    const excludedByTerms = rule.exclusionTerms.filter(keyword => normalized.includes(keyword));

    if (excludedByTerms.length > 0) continue;
    if (matchedTriggerTerms.length === 0 && matchedEmergencyTriggers.length === 0 && matchedEscalationTriggers.length === 0) continue;

    const score = (matchedTriggerTerms.length * 2) + (matchedEmergencyTriggers.length * 4) + (matchedEscalationTriggers.length * 3);
    let emergencyTriggerExplanation: string | null = null;
    if (rule.id === 'clinical_emergency') {
      if (matchedEmergencyTriggers.includes('vomiting blood') || matchedEmergencyTriggers.includes('blood in vomit')) {
        emergencyTriggerExplanation = 'Emergency trigger matched: vomiting blood / blood in vomit.';
      } else if (matchedEmergencyTriggers.length > 0) {
        emergencyTriggerExplanation = `Emergency trigger matched: ${matchedEmergencyTriggers.join(' / ')}.`;
      }
    }

    const classification: ScenarioClassification = {
      scenarioId: rule.id,
      matchedKeywords: matchedTriggerTerms,
      matchedTriggerTerms,
      matchedEmergencyTriggers,
      matchedEscalationTriggers,
      excludedByTerms,
      emergencyTriggerExplanation,
      score,
      confidence: score >= 6 ? 'high' : score >= 3 ? 'medium' : 'low',
    };

    if (!bestMatch || classification.score > bestMatch.score) {
      bestMatch = classification;
    }
  }

  return bestMatch;
}

function detectFieldStaffDistress(normalized: string): { id: string; keywords: string[] } | null {
  const kws: string[] = [];
  if (/(groped|grabbed.*chest|touched.*chest|sexually harassed|inappropriate touching|unwanted.*touch|boundary violation)/.test(normalized)) {
    kws.push('groped', 'chest', 'sexual', 'boundary');
    return { id: 'staff_sexual_boundary_violation', keywords: kws };
  }
  if (/(accus.*(theft|steal|stole)|says I stole|theft accusation|accusing me of|client accused)/.test(normalized)) {
    kws.push('accused', 'theft', 'misconduct');
    return { id: 'staff_accusation_or_misconduct_allegation', keywords: kws };
  }
  if (/(chasing.*(knife|gun|weapon)|has a (knife|gun|weapon)|trapped.*(knife|gun|client)|i am trapped|cannot leave.*(knife|client)|i do not feel safe|not safe in the home|family.*blocking.*door|client is chasing|patient is violent|hostile.*(home|client)|escalating)/.test(normalized)) {
    if (/(knife|gun|weapon|trapped|chasing me)/.test(normalized)) {
      kws.push('knife', 'weapon', 'chasing', 'trapped');
      return { id: 'active_life_threat', keywords: kws };
    }
    kws.push('not safe', 'hostile', 'blocking', 'violent');
    return { id: 'hostile_home_or_escalating_conflict', keywords: kws };
  }
  return null;
}