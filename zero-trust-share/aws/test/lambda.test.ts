import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler as uploadHandler } from '../lambda/upload';
import { handler as downloadHandler } from '../lambda/download';
import { handler as metadataHandler } from '../lambda/metadata';
import { handler as deleteHandler } from '../lambda/delete';
import { handler as authHandler } from '../lambda/auth';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('@aws-sdk/util-dynamodb');

describe('Lambda Functions', () => {
  const mockEvent: Partial<APIGatewayProxyEvent> = {
    httpMethod: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    pathParameters: {
      fileId: 'test-file-id',
    },
  };

  describe('Upload Handler', () => {
    test('should return upload URL for valid request', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        body: JSON.stringify({
          metadata: {
            originalName: 'test.txt',
            originalSize: 1024,
            burnAfterRead: false,
            expiryHours: 24,
            iv: [1, 2, 3, 4],
            uploadedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        }),
      } as APIGatewayProxyEvent;

      const result = await uploadHandler(event);
      
      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      
      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('uploadUrl');
      expect(body).toHaveProperty('fileId');
      expect(body).toHaveProperty('expiresAt');
    });

    test('should return 400 for missing metadata', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        body: JSON.stringify({}),
      } as APIGatewayProxyEvent;

      const result = await uploadHandler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    });

    test('should handle OPTIONS request', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        httpMethod: 'OPTIONS',
      } as APIGatewayProxyEvent;

      const result = await uploadHandler(event);
      
      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    });
  });

  describe('Download Handler', () => {
    test('should return download URL for valid file', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        httpMethod: 'GET',
        pathParameters: {
          fileId: 'test-file-id',
        },
      } as APIGatewayProxyEvent;

      const result = await downloadHandler(event);
      
      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      
      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('downloadUrl');
      expect(body).toHaveProperty('fileId');
      expect(body).toHaveProperty('metadata');
    });

    test('should return 404 for non-existent file', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        httpMethod: 'GET',
        pathParameters: {
          fileId: 'non-existent-file',
        },
      } as APIGatewayProxyEvent;

      const result = await downloadHandler(event);
      
      expect(result.statusCode).toBe(404);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    });

    test('should return 400 for missing file ID', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        httpMethod: 'GET',
        pathParameters: {},
      } as APIGatewayProxyEvent;

      const result = await downloadHandler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    });
  });

  describe('Metadata Handler', () => {
    test('should return metadata for valid file', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        httpMethod: 'GET',
        pathParameters: {
          fileId: 'test-file-id',
        },
      } as APIGatewayProxyEvent;

      const result = await metadataHandler(event);
      
      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      
      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('originalName');
      expect(body).toHaveProperty('originalSize');
      expect(body).toHaveProperty('burnAfterRead');
      expect(body).toHaveProperty('uploadedAt');
      expect(body).toHaveProperty('expiresAt');
      expect(body).toHaveProperty('iv');
    });

    test('should return 404 for non-existent file', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        httpMethod: 'GET',
        pathParameters: {
          fileId: 'non-existent-file',
        },
      } as APIGatewayProxyEvent;

      const result = await metadataHandler(event);
      
      expect(result.statusCode).toBe(404);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    });
  });

  describe('Delete Handler', () => {
    test('should delete file successfully', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        httpMethod: 'DELETE',
        pathParameters: {
          fileId: 'test-file-id',
        },
      } as APIGatewayProxyEvent;

      const result = await deleteHandler(event);
      
      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      
      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('message', 'File deleted successfully');
      expect(body).toHaveProperty('fileId', 'test-file-id');
    });

    test('should return 404 for non-existent file', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        httpMethod: 'DELETE',
        pathParameters: {
          fileId: 'non-existent-file',
        },
      } as APIGatewayProxyEvent;

      const result = await deleteHandler(event);
      
      expect(result.statusCode).toBe(404);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    });
  });

  describe('Auth Handler', () => {
    test('should register new user successfully', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        body: JSON.stringify({
          action: 'register',
          email: 'test@example.com',
          password: 'password123',
        }),
      } as APIGatewayProxyEvent;

      const result = await authHandler(event);
      
      expect(result.statusCode).toBe(201);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      
      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('message', 'User registered successfully');
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('user');
    });

    test('should login existing user successfully', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        body: JSON.stringify({
          action: 'login',
          email: 'test@example.com',
          password: 'password123',
        }),
      } as APIGatewayProxyEvent;

      const result = await authHandler(event);
      
      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      
      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('message', 'Login successful');
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('user');
    });

    test('should return 400 for invalid action', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        body: JSON.stringify({
          action: 'invalid',
        }),
      } as APIGatewayProxyEvent;

      const result = await authHandler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    });

    test('should return 400 for missing credentials', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        body: JSON.stringify({
          action: 'login',
        }),
      } as APIGatewayProxyEvent;

      const result = await authHandler(event);
      
      expect(result.statusCode).toBe(400);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    });
  });

  describe('Error Handling', () => {
    test('should handle internal server errors gracefully', async () => {
      const event: APIGatewayProxyEvent = {
        ...mockEvent,
        body: null,
      } as APIGatewayProxyEvent;

      const result = await uploadHandler(event);
      
      expect(result.statusCode).toBe(500);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      
      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('error', 'Internal server error');
    });
  });

  describe('CORS Headers', () => {
    test('all handlers should include CORS headers', async () => {
      const handlers = [
        { handler: uploadHandler, method: 'POST' },
        { handler: downloadHandler, method: 'GET' },
        { handler: metadataHandler, method: 'GET' },
        { handler: deleteHandler, method: 'DELETE' },
        { handler: authHandler, method: 'POST' },
      ];

      for (const { handler, method } of handlers) {
        const event: APIGatewayProxyEvent = {
          ...mockEvent,
          httpMethod: method,
          body: method === 'GET' || method === 'DELETE' ? undefined : '{}',
        } as APIGatewayProxyEvent;

        const result = await handler(event);
        
        expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
        expect(result.headers).toHaveProperty('Content-Type', 'application/json');
      }
    });
  });
});
