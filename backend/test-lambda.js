// Simple test to verify Lambda function
const serverlessExpress = require('@vendia/serverless-express');
const app = require('./server');

exports.handler = async (event, context) => {
  console.log('=== LAMBDA EVENT DEBUG ===');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  console.log('=== END DEBUG ===');
  
  // Use serverless-express
  return serverlessExpress({ app })(event, context);
};
