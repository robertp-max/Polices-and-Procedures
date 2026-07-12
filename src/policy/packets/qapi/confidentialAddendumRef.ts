export const confidentialAddendumClassifications = [
  "confidential addendum reference",
  "restricted workflow reference",
] as const;
export type ConfidentialAddendumClassification = (typeof confidentialAddendumClassifications)[number];

export const confidentialAddendumReviewStatuses = [
  "pending review",
  "reviewed",
  "restricted follow-up required",
] as const;
export type ConfidentialAddendumReviewStatus = (typeof confidentialAddendumReviewStatuses)[number];

export interface ConfidentialAddendumReferenceInput {
  readonly id: string;
  readonly sha256: string;
  readonly classification?: ConfidentialAddendumClassification;
  readonly custodian: string;
  readonly reviewer: string;
  readonly reviewStatus: ConfidentialAddendumReviewStatus;
  readonly relatedFindingIds: readonly string[];
  readonly restrictedWorkflowInstanceIds: readonly string[];
  readonly createdAt: string;
  readonly reviewedAt?: string;
}

export interface ConfidentialAddendumReference {
  readonly id: string;
  readonly sha256: string;
  readonly classification: ConfidentialAddendumClassification;
  readonly custodian: string;
  readonly reviewer: string;
  readonly reviewStatus: ConfidentialAddendumReviewStatus;
  readonly relatedFindingIds: readonly string[];
  readonly restrictedWorkflowInstanceIds: readonly string[];
  readonly createdAt: string;
  readonly reviewedAt?: string;
}

type UnknownRecord = Readonly<Record<string, unknown>>;

const disallowedReferenceKeys = [
  "address",
  "allegation",
  "allegations",
  "content",
  "dateOfBirth",
  "description",
  "disciplinaryAction",
  "discipline",
  "dob",
  "email",
  "employeeId",
  "employeeName",
  "employeeNames",
  "hrDetails",
  "investigationFact",
  "investigationFacts",
  "medicalRecordNumber",
  "memberName",
  "mrn",
  "narrative",
  "notes",
  "patientName",
  "phone",
  "residentName",
  "sanction",
  "sanctions",
  "ssn",
] as const;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeNonEmpty = (value: string, label: string): string => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new Error(`${label} is required for a confidential addendum reference.`);
  }
  return normalized;
};

const normalizeSha256 = (value: string): string => {
  const normalized = value.trim().toLowerCase().replace(/^sha256:/u, "");
  if (!/^[a-f0-9]{64}$/u.test(normalized)) {
    throw new Error("Confidential addendum reference sha256 must be a 64-character SHA-256 hex digest.");
  }
  return normalized;
};

const assertStringArray = (values: readonly string[], label: string): void => {
  for (const value of values) {
    if (typeof value !== "string") {
      throw new Error(`${label} must contain only string identifiers.`);
    }
  }
};

const uniqueNonEmpty = (values: readonly string[], label: string): readonly string[] => {
  assertStringArray(values, label);

  const result: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const normalized = normalizeNonEmpty(value, label);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(normalized);
    }
  }

  return result;
};

export const findDisallowedConfidentialReferenceKeys = (candidate: unknown): readonly string[] => {
  const matches: string[] = [];

  const visit = (value: unknown, path: string): void => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }

    if (!isRecord(value)) {
      return;
    }

    for (const [key, nestedValue] of Object.entries(value)) {
      const keyPath = path.length === 0 ? key : `${path}.${key}`;
      if (disallowedReferenceKeys.some((disallowedKey) => disallowedKey.toLowerCase() === key.toLowerCase())) {
        matches.push(keyPath);
      }
      visit(nestedValue, keyPath);
    }
  };

  visit(candidate, "");
  return matches;
};

export const assertConfidentialReferenceHasNoPhi = (candidate: unknown): void => {
  const disallowedKeys = findDisallowedConfidentialReferenceKeys(candidate);
  if (disallowedKeys.length > 0) {
    throw new Error(
      `Confidential addendum references are reference-only and must not include PHI fields: ${disallowedKeys.join(", ")}.`,
    );
  }
};

export const createConfidentialAddendumReference = (
  input: ConfidentialAddendumReferenceInput,
): ConfidentialAddendumReference => {
  assertConfidentialReferenceHasNoPhi(input);

  const reference: ConfidentialAddendumReference = {
    id: normalizeNonEmpty(input.id, "id"),
    sha256: normalizeSha256(input.sha256),
    classification: input.classification ?? "confidential addendum reference",
    custodian: normalizeNonEmpty(input.custodian, "custodian"),
    reviewer: normalizeNonEmpty(input.reviewer, "reviewer"),
    reviewStatus: input.reviewStatus,
    relatedFindingIds: uniqueNonEmpty(input.relatedFindingIds, "relatedFindingIds"),
    restrictedWorkflowInstanceIds: uniqueNonEmpty(
      input.restrictedWorkflowInstanceIds,
      "restrictedWorkflowInstanceIds",
    ),
    createdAt: normalizeNonEmpty(input.createdAt, "createdAt"),
    ...(input.reviewedAt === undefined ? {} : { reviewedAt: normalizeNonEmpty(input.reviewedAt, "reviewedAt") }),
  };

  return reference;
};

export const isConfidentialAddendumReference = (
  candidate: unknown,
): candidate is ConfidentialAddendumReference => {
  if (!isRecord(candidate)) {
    return false;
  }

  return (
    typeof candidate.id === "string" &&
    typeof candidate.sha256 === "string" &&
    confidentialAddendumClassifications.includes(candidate.classification as ConfidentialAddendumClassification) &&
    typeof candidate.custodian === "string" &&
    typeof candidate.reviewer === "string" &&
    confidentialAddendumReviewStatuses.includes(candidate.reviewStatus as ConfidentialAddendumReviewStatus) &&
    Array.isArray(candidate.relatedFindingIds) &&
    Array.isArray(candidate.restrictedWorkflowInstanceIds)
  );
};
