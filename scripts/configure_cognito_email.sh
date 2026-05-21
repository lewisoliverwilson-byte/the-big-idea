#!/usr/bin/env bash
# configure_cognito_email.sh
# Run once after SAM deploy to point Cognito's CustomEmailSender at the
# new Lambda and tell it which KMS key to use for encrypting codes.
#
# Usage:  bash scripts/configure_cognito_email.sh
# Requires: AWS CLI configured with us-east-1 credentials

set -euo pipefail

REGION="us-east-1"
USER_POOL_ID="us-east-1_3af22R2qb"
STACK_NAME="the-big-idea"

echo "Fetching Lambda ARN and KMS key ARN from CloudFormation stack..."

LAMBDA_ARN=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='EmailSenderFunctionArn'].OutputValue" \
  --output text)

KMS_ARN=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='CognitoEmailKmsKeyArn'].OutputValue" \
  --output text)

echo "  Lambda ARN : $LAMBDA_ARN"
echo "  KMS ARN    : $KMS_ARN"

echo "Updating Cognito user pool..."

aws cognito-idp update-user-pool \
  --user-pool-id "$USER_POOL_ID" \
  --region "$REGION" \
  --lambda-config "CustomEmailSender={LambdaVersion=V1_0,LambdaArn=$LAMBDA_ARN},KMSKeyID=$KMS_ARN" \
  --email-configuration "EmailSendingAccount=DEVELOPER,SourceArn=arn:aws:ses:us-east-1:050849996890:identity/lewis.oliver.wilson@gmail.com,From=Sourcery <lewis.oliver.wilson@gmail.com>"

echo ""
echo "Done! Cognito will now use the Resend Lambda for all email delivery."
echo "Test by signing up a new account at https://main.dh20jci5d0961.amplifyapp.com"
