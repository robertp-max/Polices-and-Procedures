$ErrorActionPreference = 'Stop'
$base = 'https://rtllnugat0.execute-api.us-west-1.amazonaws.com'
$body = @{
  policy_id='POL-DEMO-001'; workflow_id='WF-DEMO-001'; event_id='EVT-DEMO-001'; form_id='FRM-DEMO-001';
  filename='qapi-minutes-demo.txt'; mime_type='text/plain'; size_bytes=42; source_system='hhc'
} | ConvertTo-Json -Compress

Write-Host ">>> POST $base/uploads/init"
Write-Host "    body: $body"
$resp = Invoke-RestMethod -Method Post -Uri "$base/uploads/init" -ContentType 'application/json' -Body $body
$resp | ConvertTo-Json -Depth 5

Write-Host "`n--- PUT presigned URL ---"
'Hello HHC demo evidence — ' + (Get-Date) | Set-Content -Path "$env:TEMP\hhc-demo.txt" -NoNewline
$put = Invoke-WebRequest -Method Put -Uri $resp.presigned_put_url -InFile "$env:TEMP\hhc-demo.txt" -ContentType 'text/plain' -Headers @{'x-amz-server-side-encryption'='AES256'}
"PUT status: $($put.StatusCode) $($put.StatusDescription)"

Write-Host "`n--- GET /events/EVT-DEMO-001/files ---"
$list = Invoke-RestMethod -Method Get -Uri "$base/events/EVT-DEMO-001/files"
$list | ConvertTo-Json -Depth 6

Write-Host "`n--- GET /files/$($resp.evidence_id)/download ---"
$dl = Invoke-RestMethod -Method Get -Uri "$base/files/$($resp.evidence_id)/download?event_id=EVT-DEMO-001"
$dl | ConvertTo-Json

Write-Host "`n--- Fetch presigned GET ---"
(Invoke-WebRequest -Uri $dl.presigned_get_url).Content
