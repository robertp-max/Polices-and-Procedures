# Packet Studio Wiring — Generate from Registries

## Current flow (dump every time)

```
PacketStudioScreen
  → user pastes/uploads text
  → generateQapiFromSource.ts / generateQapiPacketModelFromText
  → parseSourceFile → buildQapiPacketModel
  → preview
```

## New flow (Slice 1)

```
PacketStudioScreen
  → user selects QAPI quarterly + reporting period
  → loadPeriodRegistries(store, periodId, agencyId, start, end)
  → if completeness OK:
        buildModelFromRegistries(regs) → preview / createPacket
     else:
        show completeness panel
        CTA: "Ingest / Refresh sources" → dump or manual entry
             → ingestParsedQapiDump(store, parsed, opts)
             → re-load registries
```

## Minimal changes to PacketStudioScreen.tsx

1. Add state:
   ```ts
   const [periodRegistries, setPeriodRegistries] = useState<QapiPeriodRegistries | null>(null);
   const [ingestResult, setIngestResult] = useState<IngestResult | null>(null);
   ```

2. On period / template select (QAPI quarterly):
   ```ts
   const regs = await loadPeriodRegistries(store, periodId, agencyId, start, end);
   setPeriodRegistries(regs);
   ```

3. Generate button:
   - If `regs.completeness.blocking_findings.length === 0`:
     call `buildModelFromRegistries(regs)` and feed into existing render / createPacket path.
   - Else disable primary Generate and show "Ingest required" with the blocking list.

4. Keep existing dump UI as secondary action labeled **"Ingest / Refresh sources"**.
   After successful ingest, re-run `loadPeriodRegistries`.

5. Do **not** remove the old dump path yet — it becomes the ingest path.
   Later, Brad extraction should write into `ParsedQapiDump` instead of only building a transient model.

## Dedup behavior user sees

| Situation | UI message |
|-----------|------------|
| New dump, all new IDs | "Inserted N records" |
| Re-upload same dump | "Skipped N duplicates (already in register)" |
| Same ID, different content | "Conflict on ID X — review before overwrite" (Slice 1 does not auto-overwrite) |

## Production rules already encoded

- Complaint total = count of ComplaintCase rows (not regex).
- Rate uses active_census from PopulationSnapshot; if census null → rate null (UNKNOWN).
- Zero complaints without ZeroComplaintAttestation → blocking finding.
- Feeder audits < 40 complete → blocking.
- Missing population snapshot → blocking.
- No silent invent of denominators.

## Files to copy into repo

```
artifacts/qapi-slice1/types/qapiRegistries.ts
  → src/policy/packets/qapi/registries/qapiRegistries.ts

artifacts/qapi-slice1/ingest/ingestQapiDump.ts
  → src/policy/packets/qapi/ingest/ingestQapiDump.ts

artifacts/qapi-slice1/ingest/inMemoryRegistryStore.ts
  → src/policy/packets/qapi/ingest/inMemoryRegistryStore.ts   (dev/UAT)

artifacts/qapi-slice1/studio/generateFromRegistries.ts
  → src/v6/screens/packets/generateFromRegistries.ts
```

## Suggested first UAT

1. Create store = createInMemoryRegistryStore()
2. Manually (or with a thin parser) map your Q2 mock into ParsedQapiDump
3. ingestParsedQapiDump(store, parsed, { source_artifact_id: 'QAPI-Q2-DS-001', created_by: 'uat' })
4. loadPeriodRegistries(...) → expect feeder_audits_complete true, complaints 7, population 112/100
5. buildModelFromRegistries(regs) → readiness READY_TO_GENERATE
6. Re-ingest same dump → skipped_duplicates > 0, inserted = 0
