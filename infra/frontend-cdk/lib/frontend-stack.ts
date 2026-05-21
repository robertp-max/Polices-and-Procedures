import { Duration, Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface FrontendStackProps extends StackProps {
  /** 'staging' | 'prod' */
  environment: string;
  /**
   * GitHub repository in "org/repo" format.
   * Used to restrict the OIDC deploy role to a specific repo + branch.
   * e.g. "careindeed/ci-policy-app"
   */
  githubRepo: string;
}

export class FrontendStack extends Stack {
  /** CloudFront distribution ID — consumed by FrontendAlarmsStack (us-east-1) */
  public readonly distributionId: string;

  /** S3 assets bucket name — used by CI/CD deploy script */
  public readonly bucketName: string;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const { environment: env, githubRepo } = props;

    // ─────────────────────────────────────────────────────────────────────
    // 1.  CloudFront Access Logs Bucket  (region: this.region = us-west-2)
    //
    //     CloudFront standard logging delivers log files using the
    //     bucket-owner-full-control canned ACL.  S3 "Block Public ACLs"
    //     intercepts ANY ACL put, not only public ones, so blockPublicAcls
    //     MUST be false on this bucket.  All other public-access blocks stay
    //     ON.  objectOwnership = BUCKET_OWNER_PREFERRED lets the bucket
    //     accept the ACL while keeping delivery objects owned by this account.
    //
    //     This is a documented AWS requirement for CloudFront access logging.
    //     No application data or user data is stored here — only CDN access
    //     records (IPs, paths, timestamps).
    // ─────────────────────────────────────────────────────────────────────
    const logsBucket = new s3.Bucket(this, 'AccessLogsBucket', {
      bucketName: `ci-policy-fe-logs-${env}-${this.account}`,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls:      false, // ← required for CloudFront log delivery
        ignorePublicAcls:     true,
        blockPublicPolicy:    true,
        restrictPublicBuckets: true,
      }),
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [
        { expiration: Duration.days(90) },
        { abortIncompleteMultipartUploadAfter: Duration.days(1) },
      ],
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // ─────────────────────────────────────────────────────────────────────
    // 2.  Frontend Assets Bucket  (region: us-west-2)
    //     Private — CloudFront via OAC is the only accessor.
    //     Stores: static HTML, JS, CSS, fonts, images.
    //     No user data.  No evidence data.
    // ─────────────────────────────────────────────────────────────────────
    const assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: `ci-policy-frontend-${env}-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,           // enables S3 versioning for point-in-time recovery
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,  // never auto-destroy — prefer manual teardown
      autoDeleteObjects: false,
      lifecycleRules: [
        {
          // Versioned release snapshots live at releases/<sha>/ — expire after 30 days.
          // The live assets at the bucket root are NOT subject to this rule.
          prefix: 'releases/',
          expiration: Duration.days(30),
          noncurrentVersionExpiration: Duration.days(7),
        },
        {
          // Clean up incomplete multipart uploads within 1 day.
          abortIncompleteMultipartUploadAfter: Duration.days(1),
        },
        {
          // Expire noncurrent root-level versions after 60 days.
          noncurrentVersionExpiration: Duration.days(60),
        },
      ],
    });

    // ─────────────────────────────────────────────────────────────────────
    // 3.  Origin Access Control (OAC)
    //     SigV4-signed requests — more secure than the legacy OAI pattern.
    //     CDK's S3BucketOrigin.withOriginAccessControl() automatically
    //     adds the matching S3 bucket resource policy.
    // ─────────────────────────────────────────────────────────────────────
    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      originAccessControlName: `ci-policy-frontend-${env}-oac`,
      description: `OAC for ci-policy-frontend ${env} — SigV4`,
      signing: cloudfront.Signing.SIGV4_NO_OVERRIDE,
    });

    // ─────────────────────────────────────────────────────────────────────
    // 4.  Security Response Headers Policy
    //     Applied to every CloudFront response (both default and /assets/*).
    //
    //     IMPORTANT — before going to production, tighten the CSP:
    //       • Replace connect-src wildcard with your exact API Gateway URL
    //       • Remove 'unsafe-inline' from style-src once Tailwind purge is
    //         confirmed to produce no inline styles at runtime
    //       • Add report-uri if you have a CSP violation endpoint
    // ─────────────────────────────────────────────────────────────────────
    const securityHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      'SecurityHeadersPolicy',
      {
        responseHeadersPolicyName: `ci-policy-frontend-${env}-security`,
        comment: 'HSTS · CSP · X-Frame-Options · Referrer-Policy · Permissions-Policy',
        securityHeadersBehavior: {
          contentTypeOptions: { override: true },
          frameOptions: {
            frameOption: cloudfront.HeadersFrameOption.DENY,
            override: true,
          },
          referrerPolicy: {
            referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: true,
          },
          strictTransportSecurity: {
            accessControlMaxAge: Duration.days(365),
            includeSubdomains: true,
            preload: true,
            override: true,
          },
          xssProtection: {
            protection: true,
            modeBlock: true,
            override: true,
          },
          contentSecurityPolicy: {
            // TODO: tighten connect-src to your exact API Gateway and Cognito endpoints.
            // 'unsafe-inline' in style-src is required for Tailwind CSS-in-JS patterns.
            contentSecurityPolicy: [
              "default-src 'self'",
              "script-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.execute-api.us-west-2.amazonaws.com https://*.amazoncognito.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
            override: true,
          },
        },
        customHeadersBehavior: {
          customHeaders: [
            {
              header: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()',
              override: true,
            },
          ],
        },
      },
    );

    // ─────────────────────────────────────────────────────────────────────
    // 5.  Cache Policies
    //
    //     immutableCachePolicy  → /assets/* only
    //       Vite content-hashes all filenames in dist/assets/, so any change
    //       produces a new filename.  1-year TTL is safe and eliminates
    //       origin fetches for returning users.
    //
    //     noCachePolicy  → default behavior (index.html + everything else)
    //       index.html references the current asset hashes.  CloudFront must
    //       never serve a stale index.html after a deploy.  maxTtl=0 tells
    //       CloudFront to always respect Cache-Control from the origin
    //       (we set "no-cache, no-store" on S3 upload).
    // ─────────────────────────────────────────────────────────────────────
    const immutableCachePolicy = new cloudfront.CachePolicy(this, 'ImmutableCachePolicy', {
      cachePolicyName: `ci-policy-frontend-${env}-immutable`,
      comment: 'Hashed Vite assets — 1 year immutable',
      defaultTtl: Duration.days(365),
      maxTtl:     Duration.days(365),
      minTtl:     Duration.days(365),
      enableAcceptEncodingGzip:    true,
      enableAcceptEncodingBrotli:  true,
      headerBehavior:      cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      cookieBehavior:      cloudfront.CacheCookieBehavior.none(),
    });

    // CloudFront rejects explicit gzip/brotli flags on custom policies when
    // caching is disabled (all TTLs at 0). Use the managed disabled policy.
    const noCachePolicy = cloudfront.CachePolicy.CACHING_DISABLED;

    // ─────────────────────────────────────────────────────────────────────
    // 6.  S3 Origin with OAC
    //     CDK automatically grants the distribution read access to the
    //     bucket via a resource policy — no manual bucket policy needed.
    // ─────────────────────────────────────────────────────────────────────
    const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(assetsBucket, {
      originAccessControl: oac,
    });

    // ─────────────────────────────────────────────────────────────────────
    // 7.  CloudFront Distribution
    // ─────────────────────────────────────────────────────────────────────
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: `ci-policy-frontend ${env} — SPA via S3 + OAC`,
      defaultRootObject: 'index.html',

      // Default behavior — serves index.html + any unlisted path with no cache.
      // React Router handles client-side routing after the first load.
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: noCachePolicy,
        responseHeadersPolicy: securityHeadersPolicy,
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods:  cloudfront.CachedMethods.CACHE_GET_HEAD,
      },

      additionalBehaviors: {
        // /assets/* — Vite content-hashed filenames, safe for 1-year caching.
        '/assets/*': {
          origin: s3Origin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: immutableCachePolicy,
          responseHeadersPolicy: securityHeadersPolicy,
          compress: true,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachedMethods:  cloudfront.CachedMethods.CACHE_GET_HEAD,
        },
      },

      // SPA routing fallback.
      // With OAC, S3 returns 403 (not 404) for missing keys.
      // Both 403 and 404 are mapped to /index.html + HTTP 200 so React
      // Router can handle the deep link on the client side.
      // ttl=0 prevents CloudFront from caching these error→200 responses.
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        },
      ],

      // CloudFront standard access logs → logs bucket (us-west-2).
      enableLogging:      true,
      logBucket:          logsBucket,
      logFilePrefix:      `cf-access-logs/${env}/`,
      logIncludesCookies: false,

      // PRICE_CLASS_100 = US + Canada + Europe PoPs.
      // Upgrade to PRICE_CLASS_ALL if you have significant APAC traffic.
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,

      // TLS 1.2 (2021) — PCI DSS and HIPAA baseline.
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,

      // Enable HTTP/2 and HTTP/3 (QUIC) for latency improvement.
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,

      // IPv6 support.
      enableIpv6: true,
    });

    this.distributionId = distribution.distributionId;
    this.bucketName     = assetsBucket.bucketName;

    // ─────────────────────────────────────────────────────────────────────
    // 8.  GitHub Actions IAM Role (OIDC — no long-lived access keys)
    //
    //     One-time prerequisite per AWS account (run once manually):
    //
    //       aws iam create-open-id-connect-provider \
    //         --url https://token.actions.githubusercontent.com \
    //         --client-id-list sts.amazonaws.com \
    //         --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
    //
    //     After deploying this stack, copy the DeployRoleArn output to
    //     your GitHub repository secrets:
    //       GH_ACTIONS_ROLE_ARN_STAGING  (for the staging environment)
    //       GH_ACTIONS_ROLE_ARN_PROD     (for the prod environment)
    // ─────────────────────────────────────────────────────────────────────
    const githubOidcProvider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      'GithubOidcProvider',
      `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`,
    );

    // Branch constraint: prod role only trusts pushes to main,
    // staging role only trusts pushes to staging.
    const branchConstraint = env === 'prod'
      ? `repo:${githubRepo}:ref:refs/heads/main`
      : `repo:${githubRepo}:ref:refs/heads/staging`;

    const deployRole = new iam.Role(this, 'GithubActionsDeployRole', {
      roleName:    `ci-policy-frontend-${env}-gh-deploy`,
      description: `GitHub Actions deploy role for ci-policy-frontend ${env}`,
      assumedBy: new iam.WebIdentityPrincipal(
        githubOidcProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': branchConstraint,
          },
        },
      ),
      maxSessionDuration: Duration.hours(1),
    });

    // S3: read + write + delete on the assets bucket (deploy and rollback).
    deployRole.addToPolicy(new iam.PolicyStatement({
      sid:    'S3DeployAccess',
      effect: iam.Effect.ALLOW,
      actions: [
        's3:PutObject',
        's3:GetObject',
        's3:DeleteObject',
        's3:ListBucket',
        's3:GetBucketLocation',
      ],
      resources: [
        assetsBucket.bucketArn,
        assetsBucket.arnForObjects('*'),
      ],
    }));

    // CloudFormation: read stack outputs to resolve bucket name + distribution ID.
    deployRole.addToPolicy(new iam.PolicyStatement({
      sid:    'CfnReadOutputs',
      effect: iam.Effect.ALLOW,
      actions: ['cloudformation:DescribeStacks'],
      resources: [
        `arn:aws:cloudformation:${this.region}:${this.account}:stack/CiPolicyFrontend-${env}/*`,
      ],
    }));

    // CloudFront: create invalidation for /index.html only.
    deployRole.addToPolicy(new iam.PolicyStatement({
      sid:    'CloudFrontInvalidate',
      effect: iam.Effect.ALLOW,
      actions: ['cloudfront:CreateInvalidation', 'cloudfront:GetDistribution'],
      resources: [
        `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
      ],
    }));

    // ─────────────────────────────────────────────────────────────────────
    // 9.  Stack Outputs
    // ─────────────────────────────────────────────────────────────────────
    new CfnOutput(this, 'DistributionId', {
      value:       distribution.distributionId,
      description: 'CloudFront distribution ID — used for invalidations and rollback',
      exportName:  `ci-policy-frontend-${env}-distribution-id`,
    });

    new CfnOutput(this, 'DistributionDomainName', {
      value:       `https://${distribution.distributionDomainName}`,
      description: 'CloudFront URL — no custom domain configured yet',
      exportName:  `ci-policy-frontend-${env}-url`,
    });

    new CfnOutput(this, 'BucketName', {
      value:       assetsBucket.bucketName,
      description: 'S3 assets bucket name — used by the deploy workflow',
      exportName:  `ci-policy-frontend-${env}-bucket`,
    });

    new CfnOutput(this, 'DeployRoleArn', {
      value:       deployRole.roleArn,
      description: 'Copy this ARN to GitHub secret: GH_ACTIONS_ROLE_ARN_STAGING or GH_ACTIONS_ROLE_ARN_PROD',
      exportName:  `ci-policy-frontend-${env}-deploy-role`,
    });

    new CfnOutput(this, 'Region', {
      value:       this.region,
      description: 'AWS region for data-bearing resources (CA/West)',
    });
  }
}
