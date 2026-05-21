import { Duration, Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

export interface FrontendAlarmsStackProps extends StackProps {
  environment: string;
  /** CloudFront distribution ID from FrontendStack */
  distributionId: string;
  /**
   * Email address to receive alarm notifications.
   * Leave empty string to skip email subscription
   * (alarms still fire to SNS — wire up additional subscribers later).
   */
  alarmEmail: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REGION NOTE — this stack MUST be deployed to us-east-1.
//
// CloudFront publishes ALL metrics exclusively to CloudWatch in us-east-1.
// CloudWatch alarms on CloudFront metrics therefore must reside in us-east-1.
//
// Data stored in this stack:
//   • SNS topic (alarm metadata only — no application or user data)
//   • CloudWatch alarm state (metric numbers only — no content)
//
// No application data, user data, or evidence data exists in this stack.
// This placement is a documented hard AWS requirement, not a design choice.
// All data-bearing resources remain in the CA/West region (us-west-2).
// ─────────────────────────────────────────────────────────────────────────────
export class FrontendAlarmsStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendAlarmsStackProps) {
    super(scope, id, props);

    const { environment: env, distributionId, alarmEmail } = props;

    // Confirm us-east-1 at synth time — fail fast rather than silently
    // create alarms in the wrong region where CloudFront metrics don't exist.
    if (this.region !== 'us-east-1') {
      throw new Error(
        `FrontendAlarmsStack must be deployed to us-east-1 ` +
        `(CloudFront metrics are only available there). ` +
        `Got: ${this.region}`,
      );
    }

    // ─────────────────────────────────────────────────────────────────────
    // 1.  SNS Topic for alarm notifications
    // ─────────────────────────────────────────────────────────────────────
    const alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      topicName:   `ci-policy-frontend-${env}-cf-alarms`,
      displayName: `ci-policy-frontend ${env} — CloudFront alarms`,
    });

    if (alarmEmail) {
      alarmTopic.addSubscription(
        new sns_subscriptions.EmailSubscription(alarmEmail),
      );
    }

    const alarmAction = new cw_actions.SnsAction(alarmTopic);

    // CloudFront metric dimensions — Region must be 'Global' for CF metrics.
    const cfDimensions: cloudwatch.DimensionHash = {
      DistributionId: distributionId,
      Region: 'Global',
    };

    // ─────────────────────────────────────────────────────────────────────
    // 2.  4xx Error Rate > 5% over 5 minutes
    //     Common causes: bad deploy (missing assets), routing misconfiguration,
    //     or S3 bucket policy regression.
    // ─────────────────────────────────────────────────────────────────────
    const alarm4xx = new cloudwatch.Alarm(this, 'HighErrorRate4xx', {
      alarmName: `ci-policy-frontend-${env}-4xx-high`,
      alarmDescription:
        'CloudFront 4xx error rate > 5% over 5 min. ' +
        'Possible causes: bad deploy, missing S3 object, or routing regression.',
      metric: new cloudwatch.Metric({
        namespace:     'AWS/CloudFront',
        metricName:    '4xxErrorRate',
        dimensionsMap: cfDimensions,
        statistic:     'Average',
        period:        Duration.minutes(5),
      }),
      threshold:           5,
      evaluationPeriods:   1,
      comparisonOperator:  cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData:    cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    alarm4xx.addAlarmAction(alarmAction);
    alarm4xx.addOkAction(alarmAction);

    // ─────────────────────────────────────────────────────────────────────
    // 3.  5xx Error Rate > 1% over 5 minutes
    //     Any 5xx from CloudFront indicates an origin-level failure.
    //     With S3+OAC there should be near-zero 5xx in steady state.
    // ─────────────────────────────────────────────────────────────────────
    const alarm5xx = new cloudwatch.Alarm(this, 'HighErrorRate5xx', {
      alarmName: `ci-policy-frontend-${env}-5xx-high`,
      alarmDescription:
        'CloudFront 5xx error rate > 1% over 5 min. ' +
        'Likely an S3 origin or CloudFront infrastructure issue.',
      metric: new cloudwatch.Metric({
        namespace:     'AWS/CloudFront',
        metricName:    '5xxErrorRate',
        dimensionsMap: cfDimensions,
        statistic:     'Average',
        period:        Duration.minutes(5),
      }),
      threshold:           1,
      evaluationPeriods:   1,
      comparisonOperator:  cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData:    cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    alarm5xx.addAlarmAction(alarmAction);
    alarm5xx.addOkAction(alarmAction);

    // ─────────────────────────────────────────────────────────────────────
    // 4.  Outputs
    // ─────────────────────────────────────────────────────────────────────
    new CfnOutput(this, 'AlarmTopicArn', {
      value:       alarmTopic.topicArn,
      description: 'SNS topic for CloudFront alarms — subscribe additional endpoints as needed',
    });

    new CfnOutput(this, 'RegionNote', {
      value:       'us-east-1 (forced by AWS — CloudFront metrics only available here)',
      description: 'Reminder: this stack is in us-east-1 by AWS requirement only. No app/user data here.',
    });
  }
}
