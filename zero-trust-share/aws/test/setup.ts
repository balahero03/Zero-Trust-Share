// Test setup file for AWS Lambda functions

// Mock AWS SDK modules
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  HeadObjectCommand: jest.fn(),
}));

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutItemCommand: jest.fn(),
  GetItemCommand: jest.fn(),
  DeleteItemCommand: jest.fn(),
  QueryCommand: jest.fn(),
  ScanCommand: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mock-signed-url.com'),
}));

jest.mock('@aws-sdk/util-dynamodb', () => ({
  marshall: jest.fn((item) => item),
  unmarshall: jest.fn((item) => item),
}));

// Mock crypto module
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mock-hash'),
  }),
  randomBytes: jest.fn().mockReturnValue(Buffer.from('mock-random-bytes')),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ email: 'test@example.com', type: 'user' }),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid'),
}));

// Set up environment variables for tests
process.env.FILE_BUCKET = 'test-file-bucket';
process.env.METADATA_BUCKET = 'test-metadata-bucket';
process.env.METADATA_TABLE = 'test-metadata-table';
process.env.SESSIONS_TABLE = 'test-sessions-table';
process.env.JWT_SECRET = 'test-jwt-secret';

// Global test utilities
global.createMockEvent = (overrides = {}) => ({
  httpMethod: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  pathParameters: {},
  body: '{}',
  ...overrides,
});

global.createMockContext = () => ({
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'test-function',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
  memoryLimitInMB: '128',
  awsRequestId: 'test-request-id',
  logGroupName: '/aws/lambda/test-function',
  logStreamName: '2024/01/01/[$LATEST]test-stream',
  getRemainingTimeInMillis: () => 30000,
  done: jest.fn(),
  fail: jest.fn(),
  succeed: jest.fn(),
});
