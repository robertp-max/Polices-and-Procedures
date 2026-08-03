import { CareIndeedEcignAdapter, CareIndeedPacketArtifactResolver } from './adapters.js';
import { GovernanceAcademyService } from './academyService.js';
import { GovernanceMeetingService } from './meetingService.js';
import { createGovernanceRepository } from './repository.js';
import { GovernanceService } from './service.js';

let singleton: GovernanceService | null = null;

export function getGovernanceService(): GovernanceService {
  if (singleton) return singleton;
  const repository = createGovernanceRepository();
  const meetings = new GovernanceMeetingService({
    repository,
    artifacts: new CareIndeedPacketArtifactResolver(),
    ecign: new CareIndeedEcignAdapter(),
  });
  const academy = new GovernanceAcademyService(repository, meetings);
  singleton = new GovernanceService(repository, meetings, academy);
  return singleton;
}

export function setGovernanceServiceForTests(service: GovernanceService | null): void {
  singleton = service;
}
