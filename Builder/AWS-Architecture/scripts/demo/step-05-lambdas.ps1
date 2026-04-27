$env:AWS_PAGER = ""
$ZIP = "c:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\AWS-Architecture\scripts\demo\hhc-lambda.zip"
$ROLE = "arn:aws:iam::$($env:ACCOUNT_ID):role/hhc-lambda-role"
$BUCKET = $env:SANDBOX  # demo build uses sandbox bucket

$fns = @('upload-init','file-list','file-download')
foreach ($name in $fns) {
  $fn = "hhc-$name"
  $lg = "/aws/lambda/$fn"
  Write-Host "`n=== $fn ==="
  aws logs describe-log-groups --log-group-name-prefix $lg --query 'logGroups[0].logGroupName' --output text 2>$null | Out-Null
  aws logs create-log-group --log-group-name $lg 2>$null | Out-Null
  aws logs put-retention-policy --log-group-name $lg --retention-in-days 7 | Out-Null

  aws lambda get-function --function-name $fn 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host ">>> aws lambda create-function --function-name $fn"
    aws lambda create-function `
      --function-name $fn `
      --runtime nodejs20.x `
      --role $ROLE `
      --handler index.handler `
      --memory-size 256 `
      --timeout 30 `
      --environment "Variables={TABLE=compliance_objects,BUCKET=$BUCKET}" `
      --zip-file "fileb://$ZIP" `
      --tags app=hhc,env=demo,fn=$name `
      --query 'FunctionArn' --output text
  } else {
    Write-Host ">>> updating $fn code + config"
    aws lambda update-function-code --function-name $fn --zip-file "fileb://$ZIP" --query 'FunctionArn' --output text | Out-Null
    aws lambda wait function-updated --function-name $fn
    aws lambda update-function-configuration --function-name $fn `
      --environment "Variables={TABLE=compliance_objects,BUCKET=$BUCKET}" --query 'FunctionArn' --output text
  }
}
"`nDONE lambdas"
