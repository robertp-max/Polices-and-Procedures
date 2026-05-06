import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Duration, Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

const stackFileDir = path.dirname(fileURLToPath(import.meta.url));

export class DemoAuthStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const autoApprovedDomain = this.node.tryGetContext('autoApprovedDomain') || process.env.AUTO_APPROVED_DOMAIN || 'careindeed.com';
    const autoApprovedEmails = this.node.tryGetContext('autoApprovedEmails') || process.env.AUTO_APPROVED_EMAILS || '';
    const appBaseUrl = this.node.tryGetContext('appBaseUrl') || process.env.APP_BASE_URL || 'http://localhost:5173';
    const allowedOriginsRaw = this.node.tryGetContext('allowedOrigins') || process.env.ALLOWED_ORIGINS;
    const allowedOrigins = Array.from(new Set((typeof allowedOriginsRaw === 'string' && allowedOriginsRaw.trim().length > 0
      ? allowedOriginsRaw.split(',')
      : [
          appBaseUrl,
          'https://dovdry3t4njek.cloudfront.net',
          'http://localhost:5173',
          'http://localhost:5176',
          'http://localhost:5177',
        ])
      .map(origin => origin.trim())
      .filter(Boolean)));
    const fromEmail = this.node.tryGetContext('fromEmail') || process.env.FROM_EMAIL || 'no-reply@example.com';
    const demoAuthDebug = String(this.node.tryGetContext('demoAuthDebug') || process.env.DEMO_AUTH_DEBUG || 'true');

    const registrationTable = new dynamodb.Table(this, 'DemoAuthRegistrationsTable', {
      tableName: 'demo_auth_registrations',
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiresAt',
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const userPool = new cognito.UserPool(this, 'DemoAuthUserPool', {
      userPoolName: 'careindeed-demo-auth-user-pool',
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      autoVerify: { email: false },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: false, mutable: true },
        familyName: { required: false, mutable: true },
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: true,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const userPoolClient = userPool.addClient('DemoAuthAppClient', {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      preventUserExistenceErrors: true,
      refreshTokenValidity: Duration.days(7),
      generateSecret: false,
    });

    const lambdaEnv = {
      APP_BASE_URL: appBaseUrl,
      COGNITO_USER_POOL_ID: userPool.userPoolId,
      COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,
      FROM_EMAIL: fromEmail,
      REGISTRATION_TABLE_NAME: registrationTable.tableName,
      SETUP_TOKEN_TTL_MINUTES: '60',
      AUTO_APPROVED_DOMAIN: autoApprovedDomain,
      AUTO_APPROVED_EMAILS: autoApprovedEmails,
      DEMO_AUTH_DEBUG: demoAuthDebug,
    };

    const registerFn = this.createHandler('RegisterRequestHandler', 'registerRequest.ts', lambdaEnv);
    const setupFn = this.createHandler('SetupAccountHandler', 'setupAccount.ts', lambdaEnv);
    const resendFn = this.createHandler('ResendSetupLinkHandler', 'resendSetupLink.ts', lambdaEnv);
    const loginFn = this.createHandler('LoginHandler', 'login.ts', lambdaEnv);
    const refreshFn = this.createHandler('RefreshHandler', 'refresh.ts', lambdaEnv);
    const meFn = this.createHandler('MeHandler', 'me.ts', lambdaEnv);
    const logoutFn = this.createHandler('LogoutHandler', 'logout.ts', lambdaEnv);
    const forgotPasswordFn = this.createHandler('ForgotPasswordHandler', 'forgotPassword.ts', lambdaEnv);
    const resetPasswordFn = this.createHandler('ResetPasswordHandler', 'resetPassword.ts', lambdaEnv);

    const handlers = [registerFn, setupFn, resendFn, loginFn, refreshFn, meFn, logoutFn, forgotPasswordFn, resetPasswordFn];

    for (const fn of handlers) {
      registrationTable.grantReadWriteData(fn);
      fn.addToRolePolicy(new iam.PolicyStatement({
        actions: [
          'cognito-idp:AdminCreateUser',
          'cognito-idp:AdminGetUser',
          'cognito-idp:AdminSetUserPassword',
          'cognito-idp:AdminUpdateUserAttributes',
          'cognito-idp:AdminEnableUser',
          'cognito-idp:InitiateAuth',
          'cognito-idp:GetUser',
          'cognito-idp:GlobalSignOut',
          'cognito-idp:ForgotPassword',
          'cognito-idp:ConfirmForgotPassword',
        ],
        resources: [userPool.userPoolArn],
      }));
      fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
      }));
    }

    const httpApi = new apigwv2.HttpApi(this, 'DemoAuthHttpApi', {
      apiName: 'careindeed-demo-auth-api',
      corsPreflight: {
        allowOrigins: allowedOrigins,
        allowCredentials: true,
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['content-type', 'authorization'],
        maxAge: Duration.hours(1),
      },
    });

    httpApi.addRoutes({
      path: '/auth/register-request',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('RegisterIntegration', registerFn),
    });
    httpApi.addRoutes({
      path: '/auth/setup-account',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('SetupIntegration', setupFn),
    });
    httpApi.addRoutes({
      path: '/auth/resend-setup-link',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('ResendIntegration', resendFn),
    });
    httpApi.addRoutes({
      path: '/auth/login',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('LoginIntegration', loginFn),
    });
    httpApi.addRoutes({
      path: '/auth/refresh',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('RefreshIntegration', refreshFn),
    });
    httpApi.addRoutes({
      path: '/auth/logout',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('LogoutIntegration', logoutFn),
    });
    httpApi.addRoutes({
      path: '/auth/me',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('MeIntegration', meFn),
    });
    httpApi.addRoutes({
      path: '/auth/forgot-password',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('ForgotPasswordIntegration', forgotPasswordFn),
    });
    httpApi.addRoutes({
      path: '/auth/reset-password',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('ResetPasswordIntegration', resetPasswordFn),
    });

    const seedUserCall = new cr.AwsCustomResource(this, 'SeedSuperAdminUser', {
      onCreate: {
        service: 'CognitoIdentityServiceProvider',
        action: 'adminCreateUser',
        parameters: {
          UserPoolId: userPool.userPoolId,
          Username: 'robertp@careindeed.com',
          MessageAction: 'SUPPRESS',
          UserAttributes: [
            { Name: 'email', Value: 'robertp@careindeed.com' },
            { Name: 'email_verified', Value: 'true' },
            { Name: 'given_name', Value: 'TJ' },
            { Name: 'family_name', Value: 'Padilla' },
          ],
        },
        physicalResourceId: cr.PhysicalResourceId.of('seed-super-admin-user'),
        ignoreErrorCodesMatching: 'UsernameExistsException',
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['cognito-idp:AdminCreateUser'],
          resources: [userPool.userPoolArn],
        }),
      ]),
    });

    const setSeedPassword = new cr.AwsCustomResource(this, 'SeedSuperAdminPassword', {
      onCreate: {
        service: 'CognitoIdentityServiceProvider',
        action: 'adminSetUserPassword',
        parameters: {
          UserPoolId: userPool.userPoolId,
          Username: 'robertp@careindeed.com',
          Password: 'Super!7',
          Permanent: true,
        },
        physicalResourceId: cr.PhysicalResourceId.of('seed-super-admin-password'),
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['cognito-idp:AdminSetUserPassword', 'cognito-idp:AdminEnableUser'],
          resources: [userPool.userPoolArn],
        }),
      ]),
    });
    setSeedPassword.node.addDependency(seedUserCall);

    const seedTable = new cr.AwsCustomResource(this, 'SeedSuperAdminRegistration', {
      onCreate: {
        service: 'DynamoDB',
        action: 'putItem',
        parameters: {
          TableName: registrationTable.tableName,
          Item: {
            pk: { S: 'EMAIL#robertp@careindeed.com' },
            sk: { S: 'REGISTRATION' },
            email: { S: 'robertp@careindeed.com' },
            emailDomain: { S: 'careindeed.com' },
            cognitoUsername: { S: 'robertp@careindeed.com' },
            status: { S: 'active' },
            approvedBy: { S: 'stack-seed' },
            approvedAt: { S: new Date().toISOString() },
            setupCompletedAt: { S: new Date().toISOString() },
            createdAt: { S: new Date().toISOString() },
            updatedAt: { S: new Date().toISOString() },
          },
        },
        physicalResourceId: cr.PhysicalResourceId.of('seed-super-admin-registration'),
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['dynamodb:PutItem'],
          resources: [registrationTable.tableArn],
        }),
      ]),
    });
    seedTable.node.addDependency(setSeedPassword);

    new CfnOutput(this, 'ApiBaseUrl', {
      value: httpApi.apiEndpoint,
      description: 'HTTP API base URL',
    });
    new CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId,
    });
    new CfnOutput(this, 'CognitoClientId', {
      value: userPoolClient.userPoolClientId,
    });
    new CfnOutput(this, 'Region', {
      value: this.region,
    });
  }

  private createHandler(name: string, entryFile: string, environment: Record<string, string>) {
    return new nodeLambda.NodejsFunction(this, name, {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(stackFileDir, '..', 'lambda', entryFile),
      handler: 'handler',
      timeout: Duration.seconds(15),
      memorySize: 256,
      environment,
      bundling: {
        target: 'node20',
        sourceMap: false,
        minify: true,
      },
    });
  }
}
