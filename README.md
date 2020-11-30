# Lambda Function
# Technology Stack
- Node.js <br/>  
- AWS-SDK for Node.js <br/>
# Prerequisites
- Install AWS cli, jq
# Build Instructions
- Clone or download the respository <br />
- Set approriate environment variables for DynamoDB table and SES domain <br />
- Zip the file and update the function version
# Deployment
- CI/CD using GitHub Actions and AWS CodeDeploy
- Run `aws deploy create-deployment` to deploy the function using blue-green deployment type


