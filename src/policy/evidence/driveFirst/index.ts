/**
 * Drive-first evidence architecture — public surface.
 *
 * North star: Google Drive stores canonical evidence artifacts. Firestore
 * stores evidence metadata and all normal operational state. Non-evidence
 * records remain metadata only. Google Cloud Storage, when used, is temporary
 * processing infrastructure and not a second evidence system of record.
 */
export * from './contracts';
export * from './driveEvidenceRepository';
export * from './tempObjectStore';
export * from './auditLedger';
export * from './metadataStore';
export * from './finalizeEvidence';
export * from './reviewEvidence';
export * from './integrityChecker';
export * from './generatePacket';
