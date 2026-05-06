# Demo Auth Setup (AWS)

This demo authentication stack provides:
- Cognito User Pool + App Client
- SES-driven setup emails
- Lambda handlers for registration/setup/login flows
- API Gateway HTTP API (`/auth/*`)
- DynamoDB registration/token table

## 1. Install dependencies

```bash
npm install
npm --prefix infra/demo-auth-cdk install
```

## 2. Configure environment

Copy `.env.example` to `.env` and populate:
- `AWS_REGION`
- `APP_BASE_URL`
- `FROM_EMAIL`
- `COGNITO_USER_POOL_ID` and `COGNITO_CLIENT_ID` (for local Express mode only)
- `REGISTRATION_TABLE_NAME`
- `AUTO_APPROVED_DOMAIN`

For frontend API target:
- `VITE_AUTH_API_BASE_URL=/api/auth` for local Express
- `VITE_AUTH_API_BASE_URL=https://<api-id>.execute-api.<region>.amazonaws.com/auth` for deployed API

## 3. Deploy AWS stack

```bash
npm run cdk:auth:deploy
```

You can pass context values:

```bash
npm --prefix infra/demo-auth-cdk run deploy -- \
  -c appBaseUrl=https://your-demo-app.example.com \
  -c fromEmail=no-reply@careindeed.com \
  -c autoApprovedDomain=careindeed.com
```

The stack outputs:
- `ApiBaseUrl`
- `CognitoUserPoolId`
- `CognitoClientId`
- `Region`

## 4. Frontend wiring

Set `VITE_AUTH_API_BASE_URL` to `${ApiBaseUrl}/auth` and restart Vite.

## 5. Seeded super admin

The stack seeds this demo user:
- Name: `TJ Padilla`
- Email: `robertp@careindeed.com`
- Password: `Super!7!7`

## 6. Local Express fallback

If you want local API instead of API Gateway, set in `.env`:
- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `REGISTRATION_TABLE_NAME`
- `FROM_EMAIL`

Then run:

```bash
npm run dev
```

The frontend can keep `VITE_AUTH_API_BASE_URL=/api/auth`.
