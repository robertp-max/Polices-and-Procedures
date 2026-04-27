@'
{"Rules":[
 {"ID":"raw-7d","Status":"Enabled","Filter":{"Prefix":"uploads/raw/"},"Expiration":{"Days":7}},
 {"ID":"validated-7d","Status":"Enabled","Filter":{"Prefix":"uploads/validated/"},"Expiration":{"Days":7}}
]}
'@ | Set-Content -Path "$env:TEMP\hhc-sb-lc.json" -Encoding ascii

@'
{"Rules":[
 {"ID":"exports-7d","Status":"Enabled","Filter":{"Prefix":"exports/"},"Expiration":{"Days":7}}
]}
'@ | Set-Content -Path "$env:TEMP\hhc-pr-lc.json" -Encoding ascii

Write-Host ">>> aws s3api put-bucket-lifecycle-configuration --bucket $env:SANDBOX --lifecycle-configuration file://$env:TEMP\hhc-sb-lc.json"
aws s3api put-bucket-lifecycle-configuration --bucket $env:SANDBOX --lifecycle-configuration "file://$env:TEMP\hhc-sb-lc.json"
Write-Host ">>> aws s3api put-bucket-lifecycle-configuration --bucket $env:PROD    --lifecycle-configuration file://$env:TEMP\hhc-pr-lc.json"
aws s3api put-bucket-lifecycle-configuration --bucket $env:PROD --lifecycle-configuration "file://$env:TEMP\hhc-pr-lc.json"
"DONE lifecycle"
