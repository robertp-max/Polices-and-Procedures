# Universal Packet Platform — Architecture (PRD §29 #13)

One event-driven platform; no bespoke per-event renderers. Layers: **contracts** →
**registries** → **engines** → **model builder** → **renderer** → **validation** →
**lifecycle/store** → **envelope/eCIgn** → **signed package** → **Drive publication** → **lock**.

```mermaid
flowchart TD
  T[Template Selector<br/>registries/templateRegistry] --> EV[Calendar Event Selector<br/>eventSelector]
  EV --> RD[Event & Readiness<br/>routes/readiness + existing-packet detection]
  RD --> SRC[Sources & Prior-Packet Lookup<br/>sources/* + drive.findPriorPacket]
  SRC --> NORM[Normalize & Validate<br/>fileParsing + sources/sourceValidation]
  NORM --> ENG[Analysis engines<br/>kpi + triggers + trends]
  ENG --> MODEL[QAPI Packet Model<br/>qapi/buildQapiPacketModel]
  MODEL --> FORMS[Canonical Form Injection<br/>qapi/formInjection]
  MODEL --> RENDER[Model-driven Renderer<br/>render/renderPacketModel + modules + charts]
  MODEL --> VAL[Validation Engine<br/>validation/validatePacket]
  VAL --> APV[Approval Readiness<br/>routes/approval]
  APV --> ENVLP[eCIgn Packet Envelope<br/>envelope/envelopeService → server/ecign]
  ENVLP --> SIGN[Signatures<br/>routes/ecign]
  SIGN --> SP[Canonical Signed Package<br/>signedPackage]
  SP --> PUB[Drive Publication + Sidecars<br/>publication → drive local adapter]
  PUB --> CERT[Certify & Lock<br/>publication postLock]
  CERT --> PRIOR[Future Prior-Period Retrieval<br/>routes/qapiPrior + trends/snapshot]
  STORE[(PacketInstance Store<br/>server/packets/store)] -.-> MODEL
  STORE -.-> APV
  STORE -.-> CERT
  AUDIT[(Hash-chained Audit Ledger)] -.-> APV
  AUDIT -.-> SIGN
  AUDIT -.-> PUB
  AUDIT -.-> CERT
```

**Dependency direction (enforced by architecture tests):** UI (`src/v6/screens/packets`) → domain
(`src/policy/packets`) → contracts. Domain must not import UI; server test/service code must not be
imported into the client build. Renderers live only under `src/policy/packets/render` (legacy
allowlisted). One rendering-profile registry unifies visual tokens.
