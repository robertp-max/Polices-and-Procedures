import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  CircleDot,
  ClipboardCheck,
  Cloud,
  FileCheck2,
  FolderGit2,
  KeyRound,
  Lock,
  Radar,
  Route,
  ServerCog,
  ShieldCheck,
  ShieldAlert,
  Spline,
  Timer,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

type SectionId =
  | 'executive-overview'
  | 'system-architecture'
  | 'identity-access'
  | 'workflow-enforcement'
  | 'training-system'
  | 'audit-evidence'
  | 'aws-infrastructure'
  | 'hipaa-gap-analysis'
  | 'production-roadmap';

interface SectionDef {
  id: SectionId;
  title: string;
  kicker: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SECTIONS: SectionDef[] = [
  { id: 'executive-overview', title: 'Executive Overview', kicker: 'System purpose', icon: Radar },
  { id: 'system-architecture', title: 'System Architecture', kicker: 'Demo vs target', icon: Spline },
  { id: 'identity-access', title: 'Identity & Access', kicker: 'Authorization model', icon: KeyRound },
  { id: 'workflow-enforcement', title: 'Workflow & Enforcement', kicker: 'Dependency engine', icon: Route },
  { id: 'training-system', title: 'Training System', kicker: '40-module journey', icon: ClipboardCheck },
  { id: 'audit-evidence', title: 'Audit & Evidence', kicker: 'Traceability', icon: FileCheck2 },
  { id: 'aws-infrastructure', title: 'AWS Infrastructure', kicker: 'Current vs missing', icon: Cloud },
  { id: 'hipaa-gap-analysis', title: 'HIPAA Gap Analysis', kicker: 'Control readiness', icon: ShieldAlert },
  { id: 'production-roadmap', title: 'Production Roadmap', kicker: 'Phased delivery', icon: Timer },
];

const SECTION_ORDER = SECTIONS.map(section => section.id);

const SECTION_SPIELS: Record<SectionId, string> = {
  'executive-overview': 'This section frames the platform as an enforcement-first compliance system, not a training-only LMS.',
  'system-architecture': 'This section visualizes today\'s demo topology and the production target architecture side by side.',
  'identity-access': 'This section maps the identity pipeline from user context to authorize() decision outcomes.',
  'workflow-enforcement': 'This section shows how dependency checks create deterministic blocked or allowed states.',
  'training-system': 'This section summarizes the 40-module track and where hard, functional, and audit-only gates apply.',
  'audit-evidence': 'This section illustrates how actions become evidence and how evidence becomes audit-ready output.',
  'aws-infrastructure': 'This section compares current demo services against missing production-hardening services.',
  'hipaa-gap-analysis': 'This section highlights control gaps and readiness posture across key regulatory categories.',
  'production-roadmap': 'This section presents the phased plan that moves the platform from demo state to production readiness.',
};

function isSectionId(value: string | undefined): value is SectionId {
  return Boolean(value && SECTION_ORDER.includes(value as SectionId));
}

const APP_PRODUCTION_URL = 'https://dovdry3t4njek.cloudfront.net';
const APP_STAGING_URL = 'https://d14dlrdifuuet5.cloudfront.net';

function PanelHeader({ kicker, title }: { kicker: string; title?: string }) {
  return (
    <div className="px-4 py-3 border-b border-[#E2E8F0] bg-white">
      <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#64748B]">{kicker}</div>
      {title ? <div className="mt-0.5 text-sm font-semibold text-[#0F172A]">{title}</div> : null}
    </div>
  );
}

function Panel({ kicker, title, children, padded = true }: { kicker?: string; title?: string; children: ReactNode; padded?: boolean }) {
  return (
    <section className="rounded-lg border border-[#E2E8F0] bg-white">
      {kicker ? <PanelHeader kicker={kicker} title={title} /> : null}
      <div className={padded ? 'p-4' : ''}>{children}</div>
    </section>
  );
}

function SplitRow({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-[#E2E8F0] md:divide-y-0 md:divide-x md:grid md:grid-cols-2">{children}</div>;
}

function Cell({ accent = 'slate', children }: { accent?: 'teal' | 'orange' | 'slate'; children: ReactNode }) {
  const tones = {
    teal: 'bg-[#F0FDFA]',
    orange: 'bg-[#FFF7ED]',
    slate: 'bg-white',
  } as const;
  return <div className={`p-4 ${tones[accent]}`}>{children}</div>;
}

function MetricCard({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'teal' | 'orange' | 'slate' }) {
  const tones = {
    teal: 'border-[#007970]/30 bg-[#007970]/6 text-[#0F766E]',
    orange: 'border-[#C74600]/30 bg-[#C74600]/6 text-[#9A3412]',
    slate: 'border-[#CBD5E1] bg-[#F8FAFC] text-[#334155]',
  } as const;

  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <div className="text-[10px] uppercase tracking-[0.16em] font-semibold">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function VisualCard({ title, body, accent = 'slate' }: { title: string; body: string; accent?: 'teal' | 'orange' | 'slate' }) {
  const accents = {
    teal: 'border-l-[#007970] bg-[#F0FDFA]',
    orange: 'border-l-[#C74600] bg-[#FFF7ED]',
    slate: 'border-l-[#334155] bg-[#F8FAFC]',
  } as const;

  return (
    <article className={`rounded-xl border border-[#E2E8F0] border-l-4 p-4 ${accents[accent]}`}>
      <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3>
      <p className="mt-1 text-xs text-[#334155] leading-5">{body}</p>
    </article>
  );
}

function Node({ label, tone = 'slate' }: { label: string; tone?: 'teal' | 'orange' | 'slate' }) {
  const tones = {
    teal: 'border-[#007970]/40 bg-[#ECFDF5] text-[#0F766E]',
    orange: 'border-[#C74600]/40 bg-[#FFF7ED] text-[#9A3412]',
    slate: 'border-[#CBD5E1] bg-white text-[#1E293B]',
  } as const;

  return <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${tones[tone]}`}>{label}</div>;
}

function Arrow() {
  return <div className="text-[#64748B] text-sm font-semibold">→</div>;
}

type ArchitectureObjectId =
  | 'cloud9'
  | 'codecommit'
  | 'codepipeline'
  | 'codebuild'
  | 'cognito'
  | 'api-gateway'
  | 'load-balancer'
  | 'fargate'
  | 'lambda'
  | 'dynamodb'
  | 'kinesis'
  | 's3-raw'
  | 's3-enriched';

interface ArchitectureObjectSpec {
  id: ArchitectureObjectId;
  label: string;
  positionClass: string;
  tone: 'teal' | 'orange' | 'slate';
}

interface ArchitectureDetail {
  title: string;
  role: string;
  interfaces: string;
  controls: string;
  failureModel: string;
  observability: string;
}

const ARCHITECTURE_OBJECTS: ArchitectureObjectSpec[] = [
  { id: 'cloud9', label: 'Cloud9', positionClass: 'left-[4%] top-[6%]', tone: 'slate' },
  { id: 'codecommit', label: 'CodeCommit', positionClass: 'left-[26%] top-[6%]', tone: 'teal' },
  { id: 'codepipeline', label: 'CodePipeline', positionClass: 'left-[42%] top-[6%]', tone: 'teal' },
  { id: 'codebuild', label: 'CodeBuild', positionClass: 'left-[58%] top-[6%]', tone: 'teal' },
  { id: 'cognito', label: 'Cognito', positionClass: 'left-[4%] top-[34%]', tone: 'orange' },
  { id: 'api-gateway', label: 'API Gateway', positionClass: 'left-[22%] top-[52%]', tone: 'teal' },
  { id: 'load-balancer', label: 'Network Load Balancer', positionClass: 'left-[38%] top-[34%]', tone: 'slate' },
  { id: 'fargate', label: 'Fargate', positionClass: 'left-[56%] top-[34%]', tone: 'orange' },
  { id: 'lambda', label: 'AWS Lambda', positionClass: 'left-[56%] top-[52%]', tone: 'orange' },
  { id: 'dynamodb', label: 'DynamoDB', positionClass: 'left-[74%] top-[34%]', tone: 'teal' },
  { id: 'kinesis', label: 'Kinesis Firehose', positionClass: 'left-[56%] top-[74%]', tone: 'teal' },
  { id: 's3-raw', label: 'S3 Raw Bucket', positionClass: 'left-[4%] top-[74%]', tone: 'slate' },
  { id: 's3-enriched', label: 'S3 Enriched Bucket', positionClass: 'left-[74%] top-[74%]', tone: 'slate' },
];

const ARCHITECTURE_DETAILS: Record<ArchitectureObjectId, ArchitectureDetail> = {
  cloud9: {
    title: 'Cloud9 Development Surface',
    role: 'Interactive cloud IDE used to author and refactor application code with direct repository integration for low-latency developer feedback loops.',
    interfaces: 'Pushes signed commit payloads into repository branch refs consumed by CodeCommit webhooks and downstream pipeline triggers.',
    controls: 'Source control policy enforcement, branch protections, and pre-merge validation gates should be enabled in production workflows.',
    failureModel: 'IDE interruption does not impact runtime workloads; it only defers code delivery velocity and build promotion cadence.',
    observability: 'Audit commit metadata, author identity, and change-set lineage to maintain deterministic traceability from code to deployment artifact.',
  },
  codecommit: {
    title: 'CodeCommit Source Authority',
    role: 'Canonical git source-of-truth for infrastructure and service code; emits repository state transitions as pipeline execution inputs.',
    interfaces: 'Delivers branch update events to CodePipeline source stage; supports pull-request and merge event hooks for quality automation.',
    controls: 'Enforce immutable history policy, signed commits, and role-based branch authorization to reduce supply-chain tampering risk.',
    failureModel: 'Repository unavailability blocks new deployment generation but preserves currently running service revisions.',
    observability: 'Track commit hash provenance, reviewer approvals, and merge timestamps for release governance and post-incident rollback targeting.',
  },
  codepipeline: {
    title: 'CodePipeline Orchestration Bus',
    role: 'Stateful CI/CD coordinator that sequences source retrieval, build execution, artifact promotion, and deployment invocation.',
    interfaces: 'Consumes repository change artifacts and dispatches build/deploy tasks to CodeBuild and runtime deployment stages.',
    controls: 'Add manual approval and policy verification stages in production to enforce controlled release progression and segregation-of-duties.',
    failureModel: 'Pipeline stage failure halts promotion before runtime mutation, protecting active workloads from unvalidated artifacts.',
    observability: 'Stage-level execution telemetry and artifact transition logs provide deterministic release timeline reconstruction.',
  },
  codebuild: {
    title: 'CodeBuild Artifact Compiler',
    role: 'Ephemeral build executor that resolves dependencies, runs validation scripts, and emits deployable containers or packaged artifacts.',
    interfaces: 'Accepts pipeline source bundles and returns versioned artifact outputs consumed by deployment steps targeting Fargate services.',
    controls: 'Harden build images, lock dependency versions, and run vulnerability/SBOM checks before artifact promotion.',
    failureModel: 'Build breakage prevents deployment and isolates defect propagation to CI boundary without impacting production traffic.',
    observability: 'Capture build logs, test matrices, and artifact digest metadata to support reproducible builds and attestation.',
  },
  cognito: {
    title: 'Cognito Identity Boundary',
    role: 'Authentication and token-issuance service that validates principal identity before API path authorization decisions are evaluated.',
    interfaces: 'Issues JWT identity/access tokens consumed by API Gateway authorizers and downstream claims-aware policy checks.',
    controls: 'Production posture should enforce MFA policy, session-risk controls, token rotation constraints, and strict client secret handling.',
    failureModel: 'Auth outage blocks new session establishment while existing token lifetimes define temporary continuity window.',
    observability: 'Monitor sign-in anomalies, token rejection rates, and risk events for suspicious identity-pattern detection.',
  },
  'api-gateway': {
    title: 'API Gateway Control Plane',
    role: 'Primary ingress for client API operations, request normalization, and policy-aware routing into internal service endpoints.',
    interfaces: 'Receives authenticated requests, evaluates authorization context, and forwards payloads to NLB/Fargate/Lambda integration paths.',
    controls: 'Apply throttling, schema validation, WAF integration, and strict route authorization to prevent abuse and malformed input propagation.',
    failureModel: 'Gateway degradation manifests as elevated 4xx/5xx at edge while backend services remain internally healthy.',
    observability: 'Inspect route-level latency histograms, error-class distribution, and authorizer decision metrics for SLO governance.',
  },
  'load-balancer': {
    title: 'Network Load Balancer Runtime Edge',
    role: 'Transport-level traffic distributor that maintains stable ingress endpoints while balancing requests across Fargate tasks.',
    interfaces: 'Accepts upstream traffic from API tier and forwards to healthy target groups backing application microservice replicas.',
    controls: 'Production design should enforce target health gate strictness, TLS policy hardening, and zonal resilience tuning.',
    failureModel: 'Target-group health collapse triggers fail-open/fail-closed behavior based on health policy and can cause service unavailability.',
    observability: 'Use connection-count, target-health, and backend-reset metrics to detect saturation and unhealthy deployment waves.',
  },
  fargate: {
    title: 'Fargate Microservice Runtime',
    role: 'Containerized execution substrate hosting stateless application services with horizontally scalable task instances.',
    interfaces: 'Processes API domain logic and reads/writes operational entities through DynamoDB and supporting event/data channels.',
    controls: 'Constrain IAM task roles, isolate network segments, and gate deployment rollout using health-aware progressive strategies.',
    failureModel: 'Task crashes are absorbed by scheduler replacement loops; widespread defect rollout requires rapid deployment rollback.',
    observability: 'Correlate per-task logs, CPU/memory pressure, and request latency to identify scaling thresholds and noisy-neighbor patterns.',
  },
  lambda: {
    title: 'Lambda Event Processor',
    role: 'Event-driven function runtime used for attribute enrichment, transformation, and asynchronous processing off the request path.',
    interfaces: 'Ingests trigger payloads from API or stream workflows and emits processed records into downstream data channels.',
    controls: 'Set strict timeout/memory budgets, dead-letter routing, and least-privilege execution roles to contain blast radius.',
    failureModel: 'Invocation retries can amplify downstream pressure if idempotency safeguards and retry backoff are not tuned.',
    observability: 'Track cold-start ratios, throttle events, and error/retry envelopes to maintain deterministic async pipeline behavior.',
  },
  dynamodb: {
    title: 'DynamoDB Operational Store',
    role: 'Low-latency NoSQL persistence layer for key-value and document access patterns used by application enforcement and audit retrieval logic.',
    interfaces: 'Receives transactional or conditional write operations from runtime services and serves read paths for workflow state evaluation.',
    controls: 'Production hardening should include PITR backup, encryption key governance, and fine-grained IAM/table policy controls.',
    failureModel: 'Hot partitions and unbounded access patterns can degrade tail latency and create conditional write contention.',
    observability: 'Monitor throttles, consumed capacity, partition heat, and conditional-check failures to preserve SLA predictability.',
  },
  kinesis: {
    title: 'Kinesis Firehose Delivery Stream',
    role: 'Managed stream delivery channel that batches, buffers, and lands transformed event payloads into durable object storage tiers.',
    interfaces: 'Accepts raw processing outputs and writes encrypted batched objects into destination S3 buckets under configured cadence/size policies.',
    controls: 'Enforce encryption, delivery retry boundaries, and destination access policy isolation for evidence-grade data pathways.',
    failureModel: 'Destination write failures accumulate retry buffers and can increase end-to-end data freshness lag.',
    observability: 'Track delivery success rate, buffer flush latency, and retry counts to detect stream backpressure early.',
  },
  's3-raw': {
    title: 'S3 Raw Data Zone',
    role: 'Landing zone for immutable raw user or event payloads before enrichment, governance labeling, and retention lifecycle transitions.',
    interfaces: 'Receives direct raw object writes from ingestion paths and exposes controlled read access for transformation workloads.',
    controls: 'Production controls should include bucket policy hardening, object lock where required, and lifecycle retention boundaries.',
    failureModel: 'Misconfigured retention or policy can cause data loss risk or unauthorized access vectors despite durable storage.',
    observability: 'Audit object creation, access patterns, and policy-change events for forensic-grade storage governance.',
  },
  's3-enriched': {
    title: 'S3 Enriched Data Zone',
    role: 'Curated object storage tier containing transformed and context-enriched records used for reporting, analytics, and audit exports.',
    interfaces: 'Ingests processed payload batches from Firehose/Lambda and serves downstream consumers under governed access scopes.',
    controls: 'Apply encryption key separation, retention controls, and strict read segmentation for high-assurance evidence handling.',
    failureModel: 'Schema drift in upstream transforms can reduce downstream query fidelity and compromise report consistency.',
    observability: 'Validate object schema contracts, ingestion lag, and consumer read anomalies to maintain data quality guarantees.',
  },
};

function ArchitectureObjectButton({
  object,
  active,
  onClick,
}: {
  object: ArchitectureObjectSpec;
  active: boolean;
  onClick: (id: ArchitectureObjectId) => void;
}) {
  const tones = {
    teal: active
      ? 'border-[#007970] bg-[#ECFDF5] text-[#0F766E] shadow-[0_0_0_2px_rgba(0,121,112,0.15)]'
      : 'border-[#99F6E4] bg-[#F0FDFA] text-[#115E59]',
    orange: active
      ? 'border-[#C74600] bg-[#FFF7ED] text-[#9A3412] shadow-[0_0_0_2px_rgba(199,70,0,0.15)]'
      : 'border-[#FCD7BE] bg-[#FFF7ED] text-[#9A3412]',
    slate: active
      ? 'border-[#475569] bg-[#F8FAFC] text-[#0F172A] shadow-[0_0_0_2px_rgba(71,85,105,0.2)]'
      : 'border-[#CBD5E1] bg-white text-[#1E293B]',
  } as const;

  return (
    <button
      type="button"
      onClick={() => onClick(object.id)}
      className={`absolute w-[146px] rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${object.positionClass} ${tones[object.tone]}`}
      aria-label={`Open ${object.label} technical explanation`}
      title={`Open ${object.label} technical explanation`}
    >
      <span className="block pr-5">{object.label}</span>
      <span className="absolute top-1.5 right-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-current/40 text-[10px]">
        ?
      </span>
    </button>
  );
}

function ExecutiveOverviewSection() {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#007970]/30 bg-[#F0FDFA]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#0F766E]">System URLs</div>
            <div className="mt-1 text-sm font-semibold text-[#0F172A]">Care Indeed Compliance Platform environments</div>
            <div className="mt-2 space-y-2 text-xs">
              <div>
                <div className="font-semibold text-[#0F172A]">Production (active login)</div>
                <a
                  href={APP_PRODUCTION_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-[#0F766E] break-all hover:underline"
                >
                  {APP_PRODUCTION_URL}
                </a>
              </div>
              <div>
                <div className="font-semibold text-[#0F172A]">Staging (AWS demo environment)</div>
                <a
                  href={APP_STAGING_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-[#0F766E] break-all hover:underline"
                >
                  {APP_STAGING_URL}
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 self-start md:self-auto">
            <a
              href={APP_PRODUCTION_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-[#007970] text-white hover:bg-[#0F766E] transition"
            >
              Open Production <ExternalLink size={13} />
            </a>
            <a
              href={APP_STAGING_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold bg-white text-[#0F766E] border border-[#0F766E]/30 hover:bg-[#F0FDFA] transition"
            >
              Open Staging <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard label="Platform Type" value="Compliance System" tone="teal" />
        <MetricCard label="Core Journey" value="40 Modules" tone="orange" />
        <MetricCard label="Engine Mode" value="Enforcement First" tone="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <VisualCard
          title="What this system is"
          body="A compliance enforcement engine that gates work based on policy and workflow state."
          accent="teal"
        />
        <VisualCard
          title="What this system is not"
          body="Not just a learning portal. Training completion alone does not unlock operational permissions."
          accent="orange"
        />
        <VisualCard
          title="Why it matters"
          body="Execution and controls stay aligned so leaders can verify readiness quickly and consistently."
        />
      </div>

      <Panel kicker="Environment framing" padded={false}>
        <SplitRow>
          <Cell accent="orange">
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#9A3412]">Current demo environment</div>
            <div className="mt-1 text-sm font-semibold text-[#0F172A]">Validation sandbox</div>
            <p className="mt-1 text-xs text-[#7C2D12] leading-5">Built to validate workflows and gates in a controlled cloud demo state.</p>
          </Cell>
          <Cell accent="teal">
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#0F766E]">Production target environment</div>
            <div className="mt-1 text-sm font-semibold text-[#0F172A]">HIPAA-ready posture</div>
            <p className="mt-1 text-xs text-[#134E4A] leading-5">Planned HIPAA-ready controls and operational hardening for high-assurance workloads.</p>
          </Cell>
        </SplitRow>
      </Panel>
    </div>
  );
}

function SystemArchitectureSection() {
  const [view, setView] = useState<'demo' | 'hipaa'>('demo');
  const [selectedObjectId, setSelectedObjectId] = useState<ArchitectureObjectId>('codepipeline');

  const nodes =
    view === 'demo'
      ? ['Web App', 'API Gateway', 'Lambda Services', 'DynamoDB', 'S3 Evidence Buckets', 'CloudWatch Logs']
      : ['Web App', 'WAF + API Gateway', 'Isolated Services', 'Data Layer (DynamoDB + optional Aurora)', 'KMS + Secrets', 'Central Audit/SIEM'];

  const comparisonRows: Array<{ layer: string; current: string; production: string }> = [
    { layer: 'Source + CI/CD', current: 'Cloud9 + CodeCommit + CodePipeline + CodeBuild', production: 'Hardened CI/CD with stage controls + signed builds' },
    { layer: 'Auth + Identity', current: 'Cognito baseline auth flow', production: 'Cognito with stricter policy, MFA posture, and lifecycle controls' },
    { layer: 'API + Edge', current: 'API Gateway direct access path', production: 'API Gateway fronted by WAF and tighter edge policy controls' },
    { layer: 'App Runtime', current: 'Fargate + Lambda service split', production: 'Segmented runtime with tighter boundaries and deployment controls' },
    { layer: 'Primary Data', current: 'DynamoDB operational records', production: 'DynamoDB + optional Aurora relational layer (recommended)' },
    { layer: 'Streaming + Storage', current: 'Kinesis Firehose to S3 evidence buckets', production: 'Encrypted pipelines + governed retention and backup strategy' },
    { layer: 'Observability', current: 'CloudWatch-centric logging baseline', production: 'Centralized audit/SIEM integration with expanded detection coverage' },
  ];

  const detail = ARCHITECTURE_DETAILS[selectedObjectId];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setView('demo')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
            view === 'demo'
              ? 'bg-[#0F766E] text-white border-[#0F766E]'
              : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
          }`}
        >
          Current AWS Demo
        </button>
        <button
          type="button"
          onClick={() => setView('hipaa')}
          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
            view === 'hipaa'
              ? 'bg-[#C74600] text-white border-[#C74600]'
              : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
          }`}
        >
          HIPAA-Ready Target
        </button>
        <span className="text-[11px] text-[#64748B]">Architecture view toggle</span>
      </div>

      <Panel kicker="Object-driven architecture explainer" padded={false}>
        <div className="px-4 pt-3 pb-2 text-xs text-[#475569] border-b border-[#F1F5F9]">Click any object with the <span className="font-semibold">?</span> badge to load a technical explanation in the right panel.</div>
        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr]">
          <div className="relative h-[500px] border-b xl:border-b-0 xl:border-r border-[#E2E8F0] overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#F1F5F9_1px,transparent_1px),linear-gradient(to_bottom,#F1F5F9_1px,transparent_1px)] bg-[size:22px_22px] opacity-60" />

            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 520" aria-hidden="true">
              <defs>
                <marker id="arch-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#64748B" />
                </marker>
              </defs>

              <line x1="170" y1="72" x2="302" y2="72" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arch-arrow)" />
              <line x1="462" y1="72" x2="620" y2="72" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arch-arrow)" />
              <line x1="330" y1="290" x2="440" y2="184" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arch-arrow)" />
              <line x1="550" y1="184" x2="676" y2="184" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arch-arrow)" />
              <line x1="688" y1="210" x2="688" y2="270" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arch-arrow)" />
              <line x1="688" y1="326" x2="688" y2="390" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arch-arrow)" />
              <line x1="310" y1="302" x2="632" y2="302" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arch-arrow)" />
              <line x1="770" y1="418" x2="880" y2="418" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arch-arrow)" />
              <line x1="90" y1="350" x2="90" y2="390" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arch-arrow)" />
            </svg>

            {ARCHITECTURE_OBJECTS.map(object => (
              <ArchitectureObjectButton
                key={object.id}
                object={object}
                active={selectedObjectId === object.id}
                onClick={setSelectedObjectId}
              />
            ))}
          </div>

          <div className="p-4 h-[500px] overflow-hidden bg-[#FAFCFB]">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#0F172A]">{detail.title}</h3>
              <HelpCircle size={16} className="text-[#007970] shrink-0" />
            </div>
            <div className="mt-3 space-y-2 text-[11px] text-[#334155] leading-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#64748B]">Role</span>
                <p>{detail.role}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#64748B]">Interfaces</span>
                <p>{detail.interfaces}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#64748B]">Controls</span>
                <p>{detail.controls}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#64748B]">Failure Model</span>
                <p>{detail.failureModel}</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#64748B]">Observability</span>
                <p>{detail.observability}</p>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="flex items-center gap-2 mb-3">
            {nodes.map((node, index) => (
              <div key={node} className="flex items-center gap-2">
                <Node label={node} tone={view === 'demo' ? 'teal' : 'orange'} />
                {index < nodes.length - 1 ? <Arrow /> : null}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <VisualCard
              title={view === 'demo' ? 'Current AWS demo state' : 'HIPAA-ready production target'}
              body={
                view === 'demo'
                  ? 'Optimized for fast validation of gating logic, evidence capture, and event flow across core managed services.'
                  : 'Target state adds defense-in-depth, stronger key/secrets controls, segmented networking, and expanded monitoring.'
              }
              accent={view === 'demo' ? 'teal' : 'orange'}
            />
            <VisualCard
              title="Architecture intent"
              body="Keep policy enforcement deterministic while scaling controls from demo maturity to regulated production maturity."
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
        <div className="grid grid-cols-3 text-[11px] font-semibold uppercase tracking-[0.12em] bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <div className="p-3">Architecture Layer</div>
          <div className="p-3">Current Demo State</div>
          <div className="p-3">Production Target State</div>
        </div>
        {comparisonRows.map(row => (
          <div key={row.layer} className="grid grid-cols-3 border-b border-[#F1F5F9] text-xs">
            <div className="p-3 font-semibold text-[#0F172A]">{row.layer}</div>
            <div className="p-3 text-[#0F766E] bg-[#F0FDFA]">{row.current}</div>
            <div className="p-3 text-[#9A3412] bg-[#FFF7ED]">{row.production}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IdentityAccessSection() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 overflow-x-auto">
        <div className="min-w-[780px] flex items-center gap-2">
          <Node label="User" tone="teal" />
          <Arrow />
          <Node label="RoleAssignment" />
          <Arrow />
          <Node label="UserGroup" />
          <Arrow />
          <Node label="Permission" tone="orange" />
          <Arrow />
          <Node label="Scope" />
          <Arrow />
          <Node label="authorize() Decision" tone="teal" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <VisualCard title="Subject layer" body="User identity is linked to role assignments and operational group context." accent="teal" />
        <VisualCard title="Policy layer" body="Permissions define allowed actions, while scopes constrain where actions can execute." />
        <VisualCard title="Runtime layer" body="authorize() evaluates request + assignment + scope to emit allow or block decisions." accent="orange" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <MetricCard label="Users" value="Identity records" />
        <MetricCard label="Groups" value="Context buckets" />
        <MetricCard label="Roles" value="Job intent" />
        <MetricCard label="Permissions" value="Action map" />
        <MetricCard label="Scopes" value="Boundary map" />
        <MetricCard label="Decision" value="Allow / Block" tone="teal" />
      </div>
    </div>
  );
}

function WorkflowEnforcementSection() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#334155]">
          <Node label="Assigned" /> <Arrow /> <Node label="In Progress" /> <Arrow /> <Node label="Dependency Check" tone="orange" /> <Arrow /> <Node label="Allowed" tone="teal" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#334155]">
          <Node label="Dependency Missing" tone="orange" /> <Arrow /> <Node label="Blocked" tone="orange" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VisualCard
          title="CEU and workflow model"
          body="Each workflow unit tracks completion, evidence quality, and required dependencies before release."
          accent="teal"
        />
        <VisualCard
          title="Enforcement result"
          body="Blocked state prevents progression until prerequisite tasks, approvals, or evidence requirements are met."
          accent="orange"
        />
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <MetricCard label="Inputs" value="Tasks + evidence" />
          <MetricCard label="Dependencies" value="Policy bound" />
          <MetricCard label="Blocked" value="Hard stop" tone="orange" />
          <MetricCard label="Allowed" value="Flow continues" tone="teal" />
        </div>
      </div>
    </div>
  );
}

function TrainingSystemSection() {
  const explainerRows = [
    {
      key: 'hard-gate',
      label: 'Hard Gate',
      detail: 'Blocking control. Users cannot proceed to dependent workflows until mandatory controls are fully completed and verified.',
      tone: 'orange' as const,
    },
    {
      key: 'functional-gate',
      label: 'Functional Gate',
      detail: 'Feature-limiting control. Core access remains, but higher-risk or role-specific actions stay restricted until completion.',
      tone: 'slate' as const,
    },
    {
      key: 'audit-only',
      label: 'Audit-only',
      detail: 'Non-blocking control. Execution continues, but compliance debt is tracked and visible for leadership and auditors.',
      tone: 'teal' as const,
    },
    {
      key: 'foundation-track',
      label: 'Foundation Track (1-10)',
      detail: 'Baseline orientation and core policy comprehension required for deterministic onboarding behavior.',
      tone: 'teal' as const,
    },
    {
      key: 'practice-track',
      label: 'Practice Track (1-15)',
      detail: 'Role-execution preparation modules focused on practical operational patterns and workflow execution quality.',
      tone: 'slate' as const,
    },
    {
      key: 'validation-track',
      label: 'Validation Track (1-15)',
      detail: 'Competency and enforcement-readiness checks used to confirm policy-to-execution alignment.',
      tone: 'orange' as const,
    },
    {
      key: 'total-modules',
      label: 'Total Modules = 40',
      detail: 'Composite path count across Foundation, Practice, and Validation segments: 10 + 15 + 15.',
      tone: 'teal' as const,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
          <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#64748B]">Hard Gate</div>
          <div className="mt-2 text-sm font-semibold text-[#0F172A]">Must pass before access</div>
          <div className="mt-1 text-xs text-[#334155]">Examples: critical onboarding validations and mandatory competency checks.</div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
          <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#64748B]">Functional Gate</div>
          <div className="mt-2 text-sm font-semibold text-[#0F172A]">Feature-limited if incomplete</div>
          <div className="mt-1 text-xs text-[#334155]">Operations can continue in restricted mode until required tasks are resolved.</div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
          <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#64748B]">Audit-only</div>
          <div className="mt-2 text-sm font-semibold text-[#0F172A]">Tracked for evidence posture</div>
          <div className="mt-1 text-xs text-[#334155]">No immediate block, but non-compliance remains visible in audit views.</div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
        <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#64748B]">40-module journey map</div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`track-a-${i}`} className="rounded-lg border border-[#CFE8E5] bg-[#F0FDFA] px-3 py-2 text-xs font-semibold text-[#0F766E]">
              Foundation {i + 1}
            </div>
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`track-b-${i}`} className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#334155]">
              Practice {i + 1}
            </div>
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={`track-c-${i}`} className="rounded-lg border border-[#FCD7BE] bg-[#FFF7ED] px-3 py-2 text-xs font-semibold text-[#9A3412]">
              Validation {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
        <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#64748B]">Explanation boxes</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {explainerRows.map(item => (
            <VisualCard
              key={item.key}
              title={item.label}
              body={item.detail}
              accent={item.tone}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <MetricCard label="Total modules" value="40" tone="teal" />
        <MetricCard label="Hard gate" value="High-risk controls" tone="orange" />
        <MetricCard label="Functional gate" value="Role-limited paths" />
        <MetricCard label="Audit-only" value="Evidence tracked" />
      </div>
    </div>
  );
}

function AuditEvidenceSection() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 overflow-x-auto">
        <div className="min-w-[760px] flex items-center gap-2">
          <Node label="Event Created" tone="teal" />
          <Arrow />
          <Node label="Workflow Action" />
          <Arrow />
          <Node label="Evidence Artifact" tone="orange" />
          <Arrow />
          <Node label="Audit Record" />
          <Arrow />
          <Node label="Export / Review" tone="teal" />
        </div>
      </div>

      <Panel kicker="Evidence sources" padded={false}>
        <SplitRow>
          <Cell accent="orange">
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#9A3412]">Demo logs</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <span className="rounded border border-[#FCD34D] bg-white px-2 py-1">upload initiated</span>
              <span className="rounded border border-[#FCD34D] bg-white px-2 py-1">upload validated</span>
              <span className="rounded border border-[#FCD34D] bg-white px-2 py-1">workflow blocked</span>
              <span className="rounded border border-[#FCD34D] bg-white px-2 py-1">workflow completed</span>
            </div>
          </Cell>
          <Cell accent="teal">
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#0F766E]">Production audit target</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <span className="rounded border border-[#6EE7B7] bg-white px-2 py-1">actor attribution</span>
              <span className="rounded border border-[#6EE7B7] bg-white px-2 py-1">tamper-evident trails</span>
              <span className="rounded border border-[#6EE7B7] bg-white px-2 py-1">retention controls</span>
              <span className="rounded border border-[#6EE7B7] bg-white px-2 py-1">centralized query</span>
            </div>
          </Cell>
        </SplitRow>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <MetricCard label="Logged" value="Actions + outcomes" />
        <MetricCard label="Evidence" value="Files + forms + eSign" />
        <MetricCard label="Timeline" value="Sequence visibility" />
        <MetricCard label="Exports" value="Survey packet" tone="teal" />
      </div>
    </div>
  );
}

function AwsInfrastructureSection() {
  const demoServices = ['S3 buckets', 'DynamoDB', 'Lambda', 'API Gateway', 'IAM role/policies', 'CloudWatch logs', 'Budget guardrail'];
  const missingForTarget = ['KMS CMKs', 'Secrets Manager', 'WAF', 'VPC isolation + private endpoints', 'Central SIEM integration', 'Backup vault strategy', 'Threat detection stack'];

  return (
    <div className="space-y-5">
      <Panel kicker="Service matrix" padded={false}>
        <SplitRow>
          <Cell accent="teal">
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#0F766E]">Current demo services</div>
            <ul className="mt-2 space-y-1 text-xs text-[#134E4A]">
              {demoServices.map(service => (
                <li key={service} className="flex items-center gap-2"><CheckCircle2 size={13} /> {service}</li>
              ))}
            </ul>
          </Cell>
          <Cell accent="orange">
            <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#9A3412]">Missing services for HIPAA-ready target</div>
            <ul className="mt-2 space-y-1 text-xs text-[#7C2D12]">
              {missingForTarget.map(service => (
                <li key={service} className="flex items-center gap-2"><CircleDot size={13} /> {service}</li>
              ))}
            </ul>
          </Cell>
        </SplitRow>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard label="Relational data layer" value="Aurora (recommended)" tone="slate" />
        <MetricCard label="Requirement level" value="Not mandatory" />
        <MetricCard label="Selection basis" value="Use-case dependent" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <MetricCard label="Storage" value="S3" />
        <MetricCard label="NoSQL" value="DynamoDB" />
        <MetricCard label="Compute" value="Lambda" />
        <MetricCard label="API" value="Gateway" />
        <MetricCard label="Identity" value="IAM" />
        <MetricCard label="Ops" value="Logs/Budget" />
      </div>
    </div>
  );
}

function HipaaGapAnalysisSection() {
  const rows: Array<{ category: string; demo: string; target: string; status: 'gap' | 'partial' | 'planned' }> = [
    { category: 'encryption', demo: 'Baseline at-rest', target: 'Expanded key governance', status: 'partial' },
    { category: 'access control', demo: 'Role baseline', target: 'Least privilege + periodic reviews', status: 'gap' },
    { category: 'audit logging', demo: 'Action logs', target: 'Centralized immutable pipeline', status: 'partial' },
    { category: 'network isolation', demo: 'Public demo routing', target: 'Segmented private architecture', status: 'gap' },
    { category: 'threat detection', demo: 'Basic monitoring', target: 'Managed detection + alerting', status: 'gap' },
    { category: 'secrets', demo: 'Limited secret controls', target: 'Dedicated secrets lifecycle', status: 'planned' },
    { category: 'backup', demo: 'Service-level defaults', target: 'Formal backup + restore drills', status: 'planned' },
  ];

  const statusClass = (status: 'gap' | 'partial' | 'planned') => {
    if (status === 'gap') return 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]';
    if (status === 'partial') return 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]';
    return 'bg-[#DBEAFE] text-[#1E3A8A] border-[#93C5FD]';
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard label="Gap count" value="3" tone="orange" />
        <MetricCard label="Partial controls" value="3" />
        <MetricCard label="Planned controls" value="2" tone="teal" />
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
        <div className="grid grid-cols-4 gap-0 text-[11px] font-semibold uppercase tracking-[0.12em] bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <div className="p-3">Control Category</div>
          <div className="p-3">Demo State</div>
          <div className="p-3">Target State</div>
          <div className="p-3">Status</div>
        </div>
        {rows.map(row => (
          <div key={row.category} className="grid grid-cols-4 gap-0 border-b border-[#F1F5F9] text-xs">
            <div className="p-3 font-semibold text-[#0F172A] capitalize">{row.category}</div>
            <div className="p-3 text-[#334155]">{row.demo}</div>
            <div className="p-3 text-[#334155]">{row.target}</div>
            <div className="p-3">
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClass(row.status)}`}>
                {row.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductionRoadmapSection() {
  const phases = [
    {
      phase: 'Phase 1',
      title: 'Demo stabilization',
      bullets: ['Finalize workflow gating consistency', 'Normalize evidence schema', 'Strengthen role mapping'],
      icon: FolderGit2,
    },
    {
      phase: 'Phase 2',
      title: 'Control hardening',
      bullets: ['Introduce key/secrets governance', 'Add network segmentation', 'Expand audit pipeline'],
      icon: Lock,
    },
    {
      phase: 'Phase 3',
      title: 'Operational readiness',
      bullets: ['Run backup/restore drills', 'Enable threat monitoring', 'Formalize incident playbooks'],
      icon: ShieldCheck,
    },
    {
      phase: 'Phase 4',
      title: 'Production launch readiness',
      bullets: ['Validation testing', 'Leadership acceptance review', 'Deployment and monitoring handoff'],
      icon: ServerCog,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto">
        <div className="min-w-[920px] grid grid-cols-4 gap-3">
          {phases.map(phase => {
            const Icon = phase.icon;
            return (
              <article key={phase.phase} className="rounded-lg border border-[#E2E8F0] bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">{phase.phase}</span>
                  <Icon size={15} className="text-[#0F766E]" />
                </div>
                <h3 className="mt-2 text-sm font-semibold text-[#0F172A]">{phase.title}</h3>
                <ul className="mt-2 space-y-1 text-xs text-[#334155]">
                  {phase.bullets.map(item => (
                    <li key={item} className="flex items-start gap-1.5">
                      <Circle size={10} className="mt-1 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <MetricCard label="Phases" value="4" tone="teal" />
        <MetricCard label="Track" value="Demo to HIPAA-ready" />
        <MetricCard label="Decision points" value="Leadership gates" />
        <MetricCard label="Outcome" value="Production readiness" tone="orange" />
      </div>
    </div>
  );
}

function SectionContent({ id }: { id: SectionId }) {
  const map: Record<SectionId, ReactNode> = {
    'executive-overview': <ExecutiveOverviewSection />,
    'system-architecture': <SystemArchitectureSection />,
    'identity-access': <IdentityAccessSection />,
    'workflow-enforcement': <WorkflowEnforcementSection />,
    'training-system': <TrainingSystemSection />,
    'audit-evidence': <AuditEvidenceSection />,
    'aws-infrastructure': <AwsInfrastructureSection />,
    'hipaa-gap-analysis': <HipaaGapAnalysisSection />,
    'production-roadmap': <ProductionRoadmapSection />,
  };

  return <>{map[id]}</>;
}

export function SystemDocumentationPage() {
  const params = useParams<{ sectionId?: string }>();
  const navigate = useNavigate();

  const activeSection = useMemo<SectionId>(() => {
    if (isSectionId(params.sectionId)) return params.sectionId;
    return 'executive-overview';
  }, [params.sectionId]);

  const currentIndex = SECTION_ORDER.indexOf(activeSection);
  const progressPct = Math.round(((currentIndex + 1) / SECTION_ORDER.length) * 100);

  useEffect(() => {
    if (!params.sectionId) {
      navigate('/system-documentation/executive-overview', { replace: true });
      return;
    }
    if (!isSectionId(params.sectionId)) {
      navigate('/system-documentation/executive-overview', { replace: true });
    }
  }, [navigate, params.sectionId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'ArrowRight' && currentIndex < SECTION_ORDER.length - 1) {
        navigate(`/system-documentation/${SECTION_ORDER[currentIndex + 1]}`);
      }
      if (event.key === 'ArrowLeft' && currentIndex > 0) {
        navigate(`/system-documentation/${SECTION_ORDER[currentIndex - 1]}`);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [currentIndex, navigate]);

  const current = SECTIONS[currentIndex];

  return (
    <div className="h-full overflow-hidden p-4 md:p-6">
      <div className="h-full min-h-0 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col lg:flex-row overflow-hidden">
        <aside className="lg:w-[280px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] bg-white p-3 md:p-4">
          <div className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#64748B]">System Documentation</div>
          <div className="mt-1 text-sm font-semibold text-[#0F172A]">Visual Module Index</div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Section progress</span>
              <span className="font-semibold text-[#0F172A]">{progressPct}%</span>
            </div>
            <div className="mt-1 grid grid-cols-9 gap-1">
              {SECTIONS.map((section, index) => (
                <span
                  key={`progress-${section.id}`}
                  className={`h-2 rounded-full ${index <= currentIndex ? 'bg-[#007970]' : 'bg-[#E2E8F0]'}`}
                />
              ))}
            </div>
          </div>

          <nav className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5" aria-label="System documentation sections">
            {SECTIONS.map((section, index) => {
              const Icon = section.icon;
              const active = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => navigate(`/system-documentation/${section.id}`)}
                  className={`w-full text-left rounded-lg border px-2.5 py-2 transition ${
                    active
                      ? 'border-[#007970]/35 bg-[#ECFDF5]'
                      : 'border-transparent bg-transparent hover:bg-[#F1F5F9]'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <div className="flex items-start gap-2">
                    <Icon size={15} className={active ? 'text-[#0F766E] mt-0.5' : 'text-[#64748B] mt-0.5'} />
                    <div className="min-w-0">
                      <div className={`text-[11px] uppercase tracking-[0.14em] font-semibold ${active ? 'text-[#047857]' : 'text-[#64748B]'}`}>
                        {index + 1}. {section.kicker}
                      </div>
                      <div className={`text-xs font-semibold leading-tight ${active ? 'text-[#0F172A]' : 'text-[#334155]'}`}>
                        {section.title}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-[#E2E8F0] px-4 md:px-6 py-4">
            <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#64748B]">Section {currentIndex + 1} of {SECTIONS.length}</div>
            <h1 className="mt-1 text-xl md:text-2xl font-semibold text-[#0F172A]">{current.title}</h1>
            <p className="mt-2 text-sm text-[#475569] max-w-3xl">{SECTION_SPIELS[activeSection]}</p>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            <SectionContent id={activeSection} />
          </div>

          <footer className="bg-white border-t border-[#E2E8F0] px-4 md:px-6 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => currentIndex > 0 && navigate(`/system-documentation/${SECTION_ORDER[currentIndex - 1]}`)}
              disabled={currentIndex === 0}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                currentIndex === 0
                  ? 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed'
                  : 'bg-white text-[#0F172A] border-[#CBD5E1] hover:bg-[#F8FAFC]'
              }`}
            >
              Previous
            </button>

            <div className="text-[11px] text-[#64748B]">
              Use section rail or arrow keys for navigation.
            </div>

            <button
              type="button"
              onClick={() => currentIndex < SECTION_ORDER.length - 1 && navigate(`/system-documentation/${SECTION_ORDER[currentIndex + 1]}`)}
              disabled={currentIndex === SECTION_ORDER.length - 1}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                currentIndex === SECTION_ORDER.length - 1
                  ? 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed'
                  : 'bg-[#007970] text-white border-[#007970] hover:bg-[#0F766E]'
              }`}
            >
              Next
            </button>
          </footer>
        </section>
      </div>

      <div className="sr-only" aria-live="polite">
        Active section: {current.title}. Progress {progressPct} percent.
      </div>
    </div>
  );
}
