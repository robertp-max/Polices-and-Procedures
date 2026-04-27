aws dynamodb describe-table --table-name compliance_objects --output json 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
  Write-Host "Table compliance_objects already exists."
} else {
  Write-Host ">>> aws dynamodb create-table compliance_objects (PAY_PER_REQUEST, AWS-owned key)"
  aws dynamodb create-table `
    --table-name compliance_objects `
    --billing-mode PAY_PER_REQUEST `
    --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S `
    --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE `
    --tags Key=app,Value=hhc Key=env,Value=demo
  Write-Host ">>> wait table-exists"
  aws dynamodb wait table-exists --table-name compliance_objects
}
aws dynamodb describe-table --table-name compliance_objects --query 'Table.[TableName,TableStatus,BillingModeSummary.BillingMode]' --output table
