import type { PacketModel } from '@/policy/packets/contracts';

import { buildQapiPacketModel } from './buildQapiPacketModel';
import type { BuildQapiPacketModelInput } from './buildQapiPacketModel';

export type BuildMonthlyQapiPacketModelInput = Omit<BuildQapiPacketModelInput, 'cadence'>;

export function buildMonthlyQapiPacketModel(
  input: BuildMonthlyQapiPacketModelInput,
): PacketModel {
  return buildQapiPacketModel({
    ...input,
    cadence: 'monthly',
  });
}
