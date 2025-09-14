import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand, GetItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { createHash, randomBytes } from 'crypto';
import { sign, verify } from 'jsonwebtoken';

const dynamoClient = new DynamoDBClient({});

const SESSIONS_TABLE = process.env.SESSIONS_TABLE!;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

interface AuthRequest {
  action: 'login' | 'register' | 'logout' | 'verify';
  email?: string;
  password?: string;
  token?: string;
}

interface User {
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt?: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Content-Type': 'application/json',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: '',
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const { action, email, password, token }: AuthRequest = JSON.parse(event.body);

    switch (action) {
      case 'register':
        return await handleRegister(email!, password!, headers);
      case 'login':
        return await handleLogin(email!, password!, headers);
      case 'logout':
        return await handleLogout(token!, headers);
      case 'verify':
        return await handleVerify(token!, headers);
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

async function handleRegister(
  email: string,
  password: string,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  if (!email || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email and password are required' }),
    };
  }

  // Check if user already exists
  const existingUser = await dynamoClient.send(new GetItemCommand({
    TableName: SESSIONS_TABLE,
    Key: {
      sessionId: { S: `user:${email}` },
    },
  }));

  if (existingUser.Item) {
    return {
      statusCode: 409,
      headers,
      body: JSON.stringify({ error: 'User already exists' }),
    };
  }

  // Create password hash
  const salt = randomBytes(32).toString('hex');
  const passwordHash = createHash('sha256')
    .update(password + salt)
    .digest('hex');

  const user: User = {
    email,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  };

  // Store user in DynamoDB
  await dynamoClient.send(new PutItemCommand({
    TableName: SESSIONS_TABLE,
    Item: marshall({
      sessionId: `user:${email}`,
      ...user,
      ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year TTL
    }),
  }));

  // Generate JWT token
  const token = sign({ email, type: 'user' }, JWT_SECRET, { expiresIn: '24h' });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({
      message: 'User registered successfully',
      token,
      user: { email },
    }),
  };
}

async function handleLogin(
  email: string,
  password: string,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  if (!email || !password) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Email and password are required' }),
    };
  }

  // Get user from DynamoDB
  const userResult = await dynamoClient.send(new GetItemCommand({
    TableName: SESSIONS_TABLE,
    Key: {
      sessionId: { S: `user:${email}` },
    },
  }));

  if (!userResult.Item) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid credentials' }),
    };
  }

  const user = unmarshall(userResult.Item) as User;

  // Verify password
  const passwordHash = createHash('sha256')
    .update(password + user.salt)
    .digest('hex');

  if (passwordHash !== user.passwordHash) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid credentials' }),
    };
  }

  // Update last login time
  await dynamoClient.send(new PutItemCommand({
    TableName: SESSIONS_TABLE,
    Item: marshall({
      sessionId: `user:${email}`,
      ...user,
      lastLoginAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year TTL
    }),
  }));

  // Generate JWT token
  const token = sign({ email, type: 'user' }, JWT_SECRET, { expiresIn: '24h' });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Login successful',
      token,
      user: { email },
    }),
  };
}

async function handleLogout(
  token: string,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  try {
    const decoded = verify(token, JWT_SECRET) as any;
    
    // Invalidate session (in a real app, you'd maintain a blacklist)
    await dynamoClient.send(new PutItemCommand({
      TableName: SESSIONS_TABLE,
      Item: marshall({
        sessionId: `blacklist:${token}`,
        ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours TTL
      }),
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Logout successful' }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }
}

async function handleVerify(
  token: string,
  headers: Record<string, string>
): Promise<APIGatewayProxyResult> {
  try {
    const decoded = verify(token, JWT_SECRET) as any;
    
    // Check if token is blacklisted
    const blacklistResult = await dynamoClient.send(new GetItemCommand({
      TableName: SESSIONS_TABLE,
      Key: {
        sessionId: { S: `blacklist:${token}` },
      },
    }));

    if (blacklistResult.Item) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Token has been revoked' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid: true,
        user: { email: decoded.email },
      }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Invalid token' }),
    };
  }
}
