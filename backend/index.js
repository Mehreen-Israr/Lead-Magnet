const serverlessExpress = require('@vendia/serverless-express');
const app = require('./server');

// Enhanced handler with proper body parsing
exports.handler = serverlessExpress({ 
  app,
  binaryMimeTypes: ['image/*', 'application/pdf']
});
