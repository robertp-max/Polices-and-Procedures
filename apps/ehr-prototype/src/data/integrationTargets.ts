export type IntegrationTargetId =
  | 'ecign'
  | 'forms'
  | 'connect'
  | 'vendorBaaControl'

export interface IntegrationTarget {
  id: IntegrationTargetId
  name: string
  owner: string
  route: string
  purpose: string
  evidence: string
}

const POLICY_APP_PORT = '5201'
const CONNECT_APP_PORT = '5192'

function localOrigin(port: string): string {
  if (typeof window === 'undefined') return `http://127.0.0.1:${port}`
  const host = window.location.hostname === 'localhost' ? 'localhost' : '127.0.0.1'
  return `http://${host}:${port}`
}

export const INTEGRATION_TARGETS: readonly IntegrationTarget[] = [
  {
    id: 'ecign',
    name: 'eCign',
    owner: 'Policy Suite · eCign',
    route: '/forms/CL-FM-029/esign?source=ehr-mvp',
    purpose: 'Collect signatures and preserve signer order, intent, and certificate evidence.',
    evidence: 'The eCign workspace owns the signing package and audit record.',
  },
  {
    id: 'forms',
    name: 'Forms Library',
    owner: 'Policy Suite · Forms',
    route: '/forms?source=ehr-mvp',
    purpose: 'Select controlled forms, templates, packets, and checklists.',
    evidence: 'The Forms Library owns the canonical form ID and version.',
  },
  {
    id: 'connect',
    name: 'Connect',
    owner: 'Connect',
    route: '/',
    purpose: 'Handle verified coworker messages and internal follow-up.',
    evidence: 'Connect owns the conversation and reply state; the EHR stores only a reference.',
  },
  {
    id: 'vendorBaaControl',
    name: 'Vendor BAA control',
    owner: 'Policy Suite · Master Controls',
    route: '/compliance/master-controls?control=CTRL-042&source=ehr-mvp',
    purpose: 'Gate vendor PHI access on the BAA inventory and lifecycle control.',
    evidence: 'CTRL-042 owns BAA status, required evidence, verification, and escalation.',
  },
]

export function getIntegrationTarget(id: IntegrationTargetId): IntegrationTarget {
  const target = INTEGRATION_TARGETS.find(item => item.id === id)
  if (!target) throw new Error(`Unknown integration target: ${id}`)
  return target
}

export function getIntegrationHref(id: IntegrationTargetId): string {
  const target = getIntegrationTarget(id)
  const origin = id === 'connect' ? localOrigin(CONNECT_APP_PORT) : localOrigin(POLICY_APP_PORT)
  return `${origin}${target.route}`
}
