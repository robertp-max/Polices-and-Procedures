# eCIgn Network Location Manual Test

## Scope
Validate backend-captured network location enrichment for eCIgn certificates and evidence metadata.

## Preconditions
- App running with API route support for `/api/ecign/*`.
- Ability to sign at least one form instance in local dev and one in deployed environment.
- Access to audit events endpoint for the signed instance.

## Test Steps
1. Sign in local development environment (`localhost`).
2. Open certificate packet and verify network fields are present:
   - `ip_address`
   - `city`
   - `state_region`
   - `country`
   - `postal`
   - `org_isp`
   - `source`
   - `captured_at`
   - `user_agent`
3. Confirm local/private behavior:
   - `lookup_status = private_or_local_ip`
   - `failure_reason = private_or_local_ip`
   - location fields remain `Unavailable` (no fake values).
4. Sign in deployed environment with a public client IP.
5. Open certificate packet and verify resolved location fields (city/state/country/org) are populated when provider returns data.
6. Query audit events for the instance and verify:
   - event `NETWORK_METADATA_CAPTURED` exists.
   - payload includes `ip`, `source`, `lookup_status`, and `failure_reason` when applicable.
   - `signature.applied` payload includes `network_location` object.
7. Refresh/reopen certificate page/packet for the same instance.
8. Confirm network location values remain identical after refresh (rendered from stored backend metadata, not live lookup).
9. Verify eSign evidence bridge payload includes `network_location` metadata.

## Expected Results
- Public IP: location fields resolve and persist.
- Local/private IP: location fields stay `Unavailable` with reason `private_or_local_ip`.
- Audit chain includes `NETWORK_METADATA_CAPTURED` and signature payload metadata.
- Certificate consistently renders stored metadata after refresh.

## Failure Triage
- If all location fields are `Unavailable` for a public IP:
  - verify header IP extraction (`x-forwarded-for`, `cf-connecting-ip`, `x-real-ip`, `request.socket.remoteAddress`),
  - verify geo provider response schema mapping,
  - inspect `lookup_status` and `failure_reason`.
- If values change after refresh:
  - confirm renderer reads audit `network_location` and not client-side live lookup.
