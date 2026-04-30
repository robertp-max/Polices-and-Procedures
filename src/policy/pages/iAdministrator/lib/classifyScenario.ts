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