$env:AWS_PAGER = ""

$trust = @'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}
'@
$policy = @"
{"Version":"2012-10-17","Statement":[
 {"Sid":"Logs","Effect":"Allow","Action":["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],"Resource":"arn:aws:logs:us-west-1:$($env:ACCOUNT_ID):*"},
 {"Sid":"DDB","Effect":"Allow","Action":["dynamodb:GetItem","dynamodb:PutItem","dynamodb:UpdateItem","dynamodb:Query","dynamodb:BatchGetItem","dynamodb:BatchWriteItem","dynamodb:DescribeTable"],"Resource":"arn:aws:dynamodb:us-west-1:$($env:ACCOUNT_ID):table/compliance_objects"},
 {"Sid":"S3Objects","Effect":"Allow","Action":["s3:PutObject","s3:GetObject","s3:GetObjectVersion","s3:AbortMultipartUpload"],"Resource":["arn:aws:s3:::$($env:SANDBOX)/*","arn:aws:s3:::$($env:PROD)/*"]},
 {"Sid":"S3List","Effect":"Allow","Action":["s3:ListBucket","s3:GetBucketLocation"],"Resource":["arn:aws:s3:::$($env:SANDBOX)","arn:aws:s3:::$($env:PROD)"]}
]}
"@
$trust  | Set-Content -Path "$env:TEMP\hhc-trust.json"  -Encoding ascii
$policy | Set-Content -Path "$env:TEMP\hhc-policy.json" -Encoding ascii

aws iam get-role --role-name hhc-lambda-role 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host ">>> aws iam create-role --role-name hhc-lambda-role"
  aws iam create-role --role-name hhc-lambda-role --assume-role-policy-document "file://$env:TEMP\hhc-trust.json" --tags Key=app,Value=hhc Key=env,Value=demo | Out-Null
} else {
  Write-Host "Role hhc-lambda-role exists."
}
Write-Host ">>> aws iam put-role-policy --role-name hhc-lambda-role --policy-name hhc-baseline"
aws iam put-role-policy --role-name hhc-lambda-role --policy-name hhc-baseline --policy-document "file://$env:TEMP\hhc-policy.json"

# Wait for role to propagate
Start-Sleep -Seconds 10
aws iam get-role --role-name hhc-lambda-role --query 'Role.Arn' --output text
