import { describe, expect, it } from "vitest";

import { courseModules } from "./contentV2Adapter";

const expectedLessonTitles: Readonly<Record<string, readonly string[]>> = {
  "GAO-006": [
    "Understanding Abuse, Neglect & Exploitation",
    "Recognizing the Signs",
    "California Mandatory Reporting Requirements",
    "Federal Regulatory Framework",
    "Internal Reporting Protocol",
    "Preventing Abuse in Practice",
    "Scenarios and Application",
    "Summary & Key Takeaways",
  ],
  "GAO-007": [
    "Infection Control in Home Health",
    "Chain of Infection",
    "Hand Hygiene",
    "Personal Protective Equipment",
    "Standard and Transmission-Based Precautions",
    "Environmental Safety in the Home",
    "Bloodborne Pathogen Exposure Protocol",
    "Module Summary",
  ],
  "GAO-008": [
    "Introduction to Emergency Preparedness",
    "Patient Medical Emergencies",
    "Earthquake",
    "Fire & Power Outage",
    "Operational Emergencies & Personal Safety",
    "Communication During Emergencies",
    "Module Summary",
  ],
  "GAO-009": [
    "Why Body Mechanics Matter",
    "Principles of Proper Body Mechanics",
    "Safe Patient Handling Techniques",
    "Ergonomics in the Home",
    "Injury Prevention Program",
    "Module Summary",
  ],
  "GAO-010": [
    "Vital Signs in Home Health",
    "Blood Pressure",
    "Heart Rate & Respiratory Rate",
    "Temperature & Oxygen Saturation",
    "Pain Assessment",
    "Critical Value Reporting",
    "Common Errors & Documentation",
    "Module Summary",
  ],
  "GAO-011": [
    "Why Communication Matters",
    "Active Listening",
    "SBAR",
    "Cognitive Impairment",
    "Family & Caregiver Communication",
    "Documentation as Communication",
    "Module Summary / Application",
  ],
  "GAO-012": [
    "Cultural Competency",
    "Health Beliefs & Practices",
    "Language Access",
    "Religious & Spiritual Care",
    "LGBTQ+ Inclusive Care",
    "Implicit Bias",
    "Module Summary",
  ],
  "GAO-013": [
    "Why Documentation Matters",
    "Documentation Standards",
    "SOAP & DAR Formats",
    "Incident Reporting",
    "EHR Best Practices",
    "Survey-Defensible Documentation",
    "Module Summary",
  ],
  "GAO-014": [
    "Time Management",
    "Professional Boundaries Defined",
    "Common Boundary Challenges",
    "Warning Signs of Boundary Drift",
    "Consequences of Boundary Violations",
    "Module Summary",
  ],
};

const expectedLessonCounts: Readonly<Record<string, number>> = {
  "GAO-002": 8,
  "GAO-003": 5,
  "GAO-004": 6,
  "GAO-005": 5,
  "GAO-006": 8,
  "GAO-007": 8,
  "GAO-008": 7,
  "GAO-009": 6,
  "GAO-010": 8,
  "GAO-011": 7,
  "GAO-012": 7,
  "GAO-013": 7,
  "GAO-014": 6,
  "GAO-015": 4,
  "GAO-016": 4,
  "GAO-017": 3,
  "GAO-018": 2,
  "GAO-019": 3,
  "GAO-020": 2,
  "GAO-021": 2,
  "GAO-022": 2,
  "GAO-023": 2,
  "GAO-024": 2,
  "GAO-025": 2,
  "GAO-026": 2,
  "GAO-027": 2,
};

describe("GAO markdown content inventory", () => {
  it("renders all 120 intended GAO-002 through GAO-027 lessons", () => {
    const actualCounts = Object.fromEntries(
      Object.keys(expectedLessonCounts).map((moduleId) => {
        const module = courseModules.find((candidate) => candidate.id === moduleId);
        return [moduleId, module?.lessons.length ?? 0];
      }),
    );

    expect(actualCounts).toEqual(expectedLessonCounts);
    expect(Object.values(actualCounts).reduce((total, count) => total + count, 0)).toBe(120);
  });

  it("preserves the intended GAO-006 through GAO-014 lesson titles", () => {
    for (const [moduleId, titles] of Object.entries(expectedLessonTitles)) {
      const module = courseModules.find((candidate) => candidate.id === moduleId);
      expect(module?.lessons.map((lesson) => lesson.title), moduleId).toEqual(titles);
    }
  });

  it("keeps substantive learner content behind every audited lesson", () => {
    for (const moduleId of Object.keys(expectedLessonCounts)) {
      const module = courseModules.find((candidate) => candidate.id === moduleId);
      expect(module, moduleId).toBeDefined();

      for (const lesson of module?.lessons ?? []) {
        expect(lesson.transcript.length, `${moduleId} ${lesson.id}`).toBeGreaterThan(200);
        expect(lesson.transcript, `${moduleId} ${lesson.id}`).not.toMatch(/MODULE QA SUMMARY|Narration Script\s*\(/i);
      }
    }
  });
});
