import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Duration, Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

const stackFileDir = path.dirname(fileURLToPath(import.meta.url));

export interface CesApiStackProps extends StackProps {
  environment: string;
  allowedOrigins: string[];
}

/* ═══════════════════════════════════════════════════════════════
   CES metadata API stack.

     - DynamoDB table  → NON-PHI CES metadata + evidence pointers.
                         pk/sk single-table; PAY_PER_REQUEST.
     - Lambda          → serves the CES routes; rejects file bytes.
     - HTTP API (v2)   → fronts the Lambda; consumed by CloudFront
                         /api/* behavior (same-origin) on staging.

   Files/artifacts are NEVER stored here — they live in Google Drive.
   ═══════════════════════════════════════════════════════════════ */
export class CesApiStack extends Stack {
  public readonly apiEndpoint: string;
  public readonly tableName: string;

  constructor(scope: Construct, id: string, props: CesApiStackProps) {
    super(scope, id, props);
    const { environment: env, allowedOrigins } = props;

    // Single-table metadata store. RETAIN so a stack teardown never silently
    // drops CES operational state. TTL is available but unused (state is live).
    const table = new dynamodb.Table(this, 'CesMetadataTable', {
      tableName: `ces_metadata_${env}`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: RemovalPolicy.RETAIN,
    });
    this.tableName = table.tableName;

    const cesFn = new nodeLambda.NodejsFunction(this, 'CesApiHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(stackFileDir, '..', 'lambda', 'cesApi.ts'),
      handler: 'handler',
      timeout: Duration.seconds(15),
      memorySize: 256,
      environment: {
        CES_METADATA_TABLE_NAME: table.tableName,
        CES_API_ENV: env,
      },
      bundling: { target: 'node20', sourceMap: false, minify: true },
    });

    table.grantReadWriteData(cesFn);

    const httpApi = new apigwv2.HttpApi(this, 'CesHttpApi', {
      apiName: `ces-metadata-api-${env}`,
      corsPreflight: {
        allowOrigins: allowedOrigins,
        allowCredentials: false,
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['content-type', 'authorization'],
        maxAge: Duration.hours(1),
      },
    });

    // Catch-all → single Lambda. The handler routes on rawPath, tolerating an
    // optional /api prefix (CloudFront forwards /api/* unchanged).
    const integration = new integrations.HttpLambdaIntegration('CesIntegration', cesFn);
    httpApi.addRoutes({ path: '/{proxy+}', methods: [apigwv2.HttpMethod.ANY], integration });
    httpApi.addRoutes({ path: '/', methods: [apigwv2.HttpMethod.ANY], integration });

    this.apiEndpoint = httpApi.apiEndpoint;

    new CfnOutput(this, 'CesApiEndpoint', {
      value: httpApi.apiEndpoint,
      description: 'CES metadata HTTP API base URL. Use the host as the CloudFront /api/* origin.',
      exportName: `ces-metadata-api-${env}-endpoint`,
    });
    new CfnOutput(this, 'CesApiOriginDomain', {
      value: `${httpApi.httpApiId}.execute-api.${this.region}.amazonaws.com`,
      description: 'Origin domain for the CloudFront /api/* behavior (pass as -c apiOrigin=...).',
      exportName: `ces-metadata-api-${env}-origin`,
    });
    new CfnOutput(this, 'CesMetadataTableName', {
      value: table.tableName,
      description: 'DynamoDB table holding NON-PHI CES metadata + evidence pointers.',
      exportName: `ces-metadata-api-${env}-table`,
    });
  }
}
