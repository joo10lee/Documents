# FeelFlow Backend (AWS Serverless)

This directory contains the backend infrastructure and code for FeelFlow.

## Architecture
- **Compute**: AWS Lambda (Node.js)
- **API**: AWS API Gateway (REST)
- **Database**: AWS DynamoDB (On-Demand)
- **Auth**: AWS Cognito (Planned for Guardian Mode)

## Setup
1. Install AWS CLI and SAM CLI.
2. Run `sam build` and `sam deploy --guided` to provision resources.
