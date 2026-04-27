$env:AWS_PAGER = ""
$apiName = "hhc-demo-api"

$apiId = aws apigatewayv2 get-apis --query "Items[?Name=='$apiName'].ApiId | [0]" --output text
if ([string]::IsNullOrEmpty($apiId) -or $apiId -eq 'None') {
  Write-Host ">>> aws apigatewayv2 create-api --name $apiName"
  $apiId = aws apigatewayv2 create-api `
    --name $apiName `
    --protocol-type HTTP `
    --cors-configuration "AllowOrigins=*,AllowMethods=GET,POST,OPTIONS,AllowHeaders=content-type,authorization,idempotency-key" `
    --query 'ApiId' --output text
}
Write-Host "ApiId=$apiId"

function New-RouteAndIntegration($method, $path, $fn) {
  $fnArn = "arn:aws:lambda:us-west-1:$($env:ACCOUNT_ID):function:$fn"
  Write-Host ">>> integration -> $fn"
  $intId = aws apigatewayv2 create-integration --api-id $apiId `
    --integration-type AWS_PROXY --integration-uri $fnArn `
    --payload-format-version 2.0 --query 'IntegrationId' --output text
  Write-Host ">>> route $method $path -> $intId"
  aws apigatewayv2 create-route --api-id $apiId --route-key "$method $path" --target "integrations/$intId" --query 'RouteId' --output text | Out-Null

  $stmtId = "apigw-$fn-" + ([guid]::NewGuid().ToString().Substring(0,8))
  $srcArn = "arn:aws:execute-api:us-west-1:$($env:ACCOUNT_ID):$apiId/*/*"
  Write-Host ">>> lambda add-permission $fn ($stmtId)"
  aws lambda add-permission --function-name $fn --statement-id $stmtId `
    --action lambda:InvokeFunction --principal apigateway.amazonaws.com `
    --source-arn $srcArn --query 'Statement' --output text 2>$null | Out-Null
}

New-RouteAndIntegration 'POST' '/uploads/init'                 'hhc-upload-init'
New-RouteAndIntegration 'GET'  '/events/{event_id}/files'      'hhc-file-list'
New-RouteAndIntegration 'GET'  '/files/{evidence_id}/download' 'hhc-file-download'

# Default stage with auto-deploy
aws apigatewayv2 get-stage --api-id $apiId --stage-name '$default' 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host ">>> create stage \$default (auto-deploy)"
  aws apigatewayv2 create-stage --api-id $apiId --stage-name '$default' --auto-deploy --query 'StageName' --output text
} else {
  aws apigatewayv2 update-stage --api-id $apiId --stage-name '$default' --auto-deploy --query 'StageName' --output text
}

$endpoint = aws apigatewayv2 get-api --api-id $apiId --query 'ApiEndpoint' --output text
Write-Host "`nAPI endpoint: $endpoint"
$endpoint | Set-Content -Path "$env:TEMP\hhc-api-endpoint.txt"
