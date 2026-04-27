#!/usr/bin/env bash
# Phase 1 — Step 4: SNS topic + email subscription + monthly Budget
# Region: us-west-1 (Budgets is global but commands run anyway).

set -euo pipefail
REGION=us-west-1
ACCOUNT_ID="${ACCOUNT_ID:?Set ACCOUNT_ID env var}"
ALERT_EMAIL="${ALERT_EMAIL:?Set ALERT_EMAIL env var}"

TOPIC_NAME=hhc-alerts

echo ">>> Create SNS topic ${TOPIC_NAME}"
TOPIC_ARN=$(aws sns create-topic --region "$REGION" --name "$TOPIC_NAME" --query 'TopicArn' --output text)
echo "    ${TOPIC_ARN}"

echo ">>> Subscribe ${ALERT_EMAIL} (confirm via email)"
aws sns subscribe --region "$REGION" --topic-arn "$TOPIC_ARN" --protocol email --notification-endpoint "$ALERT_EMAIL" >/dev/null

cat > /tmp/hhc-budget.json <<JSON
{
  "BudgetName": "hhc-monthly-budget",
  "BudgetLimit": { "Amount": "150", "Unit": "USD" },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST",
  "CostTypes": { "IncludeTax": true, "IncludeSubscription": true, "UseBlended": false }
}
JSON

cat > /tmp/hhc-budget-notifs.json <<JSON
[
  { "Notification": { "NotificationType":"ACTUAL", "ComparisonOperator":"GREATER_THAN", "Threshold":33.0, "ThresholdType":"PERCENTAGE" },
    "Subscribers":[{ "SubscriptionType":"SNS","Address":"${TOPIC_ARN}" }] },
  { "Notification": { "NotificationType":"ACTUAL", "ComparisonOperator":"GREATER_THAN", "Threshold":80.0, "ThresholdType":"PERCENTAGE" },
    "Subscribers":[{ "SubscriptionType":"SNS","Address":"${TOPIC_ARN}" }] },
  { "Notification": { "NotificationType":"FORECASTED", "ComparisonOperator":"GREATER_THAN", "Threshold":100.0, "ThresholdType":"PERCENTAGE" },
    "Subscribers":[{ "SubscriptionType":"SNS","Address":"${TOPIC_ARN}" }] }
]
JSON

echo ">>> Create budget hhc-monthly-budget (\$150 hard, \$50 soft via 33% alert)"
aws budgets create-budget --account-id "$ACCOUNT_ID" \
  --budget file:///tmp/hhc-budget.json \
  --notifications-with-subscribers file:///tmp/hhc-budget-notifs.json || \
  echo "    (budget may already exist — skipping)"

echo "DONE: SNS + Budgets configured.  CONFIRM EMAIL SUBSCRIPTION."
