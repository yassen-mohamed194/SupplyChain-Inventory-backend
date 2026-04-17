const swaggerJSDoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 8002;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'SupplyChain Inventory API',
      version: '1.0.0',
      description:
        'API documentation for authentication and user management modules.',
      contact: {
        name: 'Backend Team',
      },
    },
    servers: [
      {
        url: BASE_URL,
        description: 'Current environment',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints (ADMIN only)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Send JWT in Authorization header as: Bearer <token>',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Internal server error' },
          },
          required: ['success', 'message'],
        },
        AuthLoginRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@scm.com' },
            password: { type: 'string', format: 'password', example: 'Password123!' },
          },
          required: ['email', 'password'],
        },
        AuthUserProfile: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Admin User' },
            email: { type: 'string', format: 'email', example: 'admin@scm.com' },
            role: {
              type: 'string',
              enum: ['ADMIN', 'ACCOUNTANT', 'WAREHOUSE', 'USER'],
              example: 'ADMIN',
            },
          },
          required: ['name', 'email', 'role'],
        },
        AuthLoginResponseData: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: '67f1234567890abcde123456' },
                name: { type: 'string', example: 'Admin User' },
                email: { type: 'string', format: 'email', example: 'admin@scm.com' },
                role: {
                  type: 'string',
                  enum: ['ADMIN', 'ACCOUNTANT', 'WAREHOUSE', 'USER'],
                  example: 'ADMIN',
                },
              },
              required: ['id', 'name', 'email', 'role'],
            },
          },
          required: ['token', 'user'],
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67f1234567890abcde123456' },
            name: { type: 'string', example: 'Warehouse Manager' },
            email: { type: 'string', format: 'email', example: 'warehouse@scm.com' },
            role: {
              type: 'string',
              enum: ['ADMIN', 'ACCOUNTANT', 'WAREHOUSE', 'USER'],
              example: 'WAREHOUSE',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['_id', 'name', 'email', 'role'],
        },
        CreateUserRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'New User' },
            email: { type: 'string', format: 'email', example: 'new.user@scm.com' },
            password: { type: 'string', format: 'password', minLength: 8, example: 'Password123!' },
            role: {
              type: 'string',
              enum: ['ADMIN', 'ACCOUNTANT', 'WAREHOUSE', 'USER'],
              example: 'ACCOUNTANT',
            },
          },
          required: ['name', 'email', 'password'],
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Updated Name' },
            email: { type: 'string', format: 'email', example: 'updated@scm.com' },
            role: {
              type: 'string',
              enum: ['ADMIN', 'ACCOUNTANT', 'WAREHOUSE', 'USER'],
              example: 'USER',
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid authentication token.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              examples: {
                missingToken: {
                  value: {
                    success: false,
                    message: 'Unauthorized: missing token',
                  },
                },
              },
            },
          },
        },
        Forbidden: {
          description: 'Authenticated user does not have required role.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
              examples: {
                forbidden: {
                  value: {
                    success: false,
                    message: 'Forbidden',
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Unexpected server-side error.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' },
            },
          },
        },
      },
    },
  },
  apis: ['./Modules/AUTH/*.js', './Modules/Users/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;