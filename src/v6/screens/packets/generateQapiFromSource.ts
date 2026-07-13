/**
 * Browser-safe "upload source → generate QAPI packet" bridge for Packet Studio.
 *
 * Runs the same domain pipeline the §24 e2e uses (parseSourceFile →
 * buildQapiPacketModel: segment → derive → KPIs → findings → trends → model),
 * so a pasted/uploaded QAPI source dataset produces a real analytical PacketModel
 * (KPIs, findings, workflows) rather than an empty stub. No server round-trip and
 * no Node APIs — safe to import into the client bundle.
 */
import { parseSourceFile } from '@/policy/evidence/intake/fileParsing';
import { buildQapiPacketModel } from '@/policy/packets/qapi/buildQapiPacketModel';
import type { PacketModel } from '@/policy/packets/contracts';
import type { QapiPacketOptions } from '@/policy/qapi/renderQapiPacket';
import type { EventCardModel } from './eventSelector/eventCardModel';

function guessMimeType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.json')) return 'application/json';
  if (lower.endsWith('.csv')) return 'text/csv';
  if (lower.endsWith('.tsv')) return 'text/tab-separated-values';
  if (lower.endsWith('.md')) return 'text/markdown';
  return 'text/plain';
}

function qapiCadence(templateId: string): 'monthly' | 'quarterly' {
  return templateId.toLowerCase().includes('monthly') ? 'monthly' : 'quarterly';
}

export interface GenerateQapiInput {
  readonly text: string;
  readonly fileName: string;
  readonly event: EventCardModel;
  readonly templateId: string;
  readonly generatedAtISO: string;
}

/**
 * Generate a QAPI analytical PacketModel from raw uploaded/pasted source text.
 * Segmentation resolves the correct quarter by the selected event date and
 * fails closed on ambiguity; missing values render UNKNOWN, never false zeroes.
 */
export function generateQapiPacketModelFromText(input: GenerateQapiInput): PacketModel {
  const { text, fileName, event, templateId, generatedAtISO } = input;
  const parsed = parseSourceFile({
    fileName,
    mimeType: guessMimeType(fileName),
    byteLength: new TextEncoder().encode(text).length,
    text,
  });
  const options: QapiPacketOptions = {
    eventId: event.eventInstanceId,
    workflowId: event.workflowId ?? undefined,
    preparedBy: 'Packet Studio',
    reviewer: 'Compliance Officer',
  };
  return buildQapiPacketModel({
    parsed,
    eventDateISO: event.eventDate,
    sourceId: fileName,
    cadence: qapiCadence(templateId),
    generatedAt: generatedAtISO,
    packetVersion: 1,
    options,
  });
}
