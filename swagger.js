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
        'API documentation for the SupplyChain Inventory backend.',
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
    paths: {
      '/api/suppliers': {
        get: {
          tags: ['Suppliers'],
          summary: 'List suppliers',
          description:
            'Retrieve all suppliers, sorted by creation date descending. (Roles: ADMIN, WAREHOUSE)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of suppliers',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Supplier' },
                      },
                    },
                    required: ['success', 'data'],
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        post: {
          tags: ['Suppliers'],
          summary: 'Create supplier',
          description: 'Create a supplier. (Role: ADMIN)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateSupplierRequest' },
                examples: {
                  createSupplier: {
                    value: {
                      name: 'Acme Supplies Ltd',
                      phone: '+1-555-0100',
                      address: '123 Industrial Ave, Cairo',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Supplier created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Supplier' },
                    },
                    required: ['success', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
      '/api/suppliers/{id}': {
        get: {
          tags: ['Suppliers'],
          summary: 'Get supplier by id',
          description:
            'Retrieve one supplier by MongoDB ObjectId. (Roles: ADMIN, WAREHOUSE)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the supplier',
              example: '67f1234567890abcde123456',
            },
          ],
          responses: {
            200: {
              description: 'Supplier found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Supplier' },
                    },
                    required: ['success', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid supplier id',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    invalidId: {
                      value: { success: false, message: 'Invalid supplier id' },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: {
              description: 'Supplier not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    notFound: { value: { success: false, message: 'Supplier not found' } },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        put: {
          tags: ['Suppliers'],
          summary: 'Update supplier by id',
          description: 'Update supplier fields. (Role: ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the supplier',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateSupplierRequest' },
                examples: { updateSupplier: { value: { phone: '+1-555-0101' } } },
              },
            },
          },
          responses: {
            200: {
              description: 'Supplier updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Supplier' },
                    },
                    required: ['success', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid supplier id or validation error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: {
              description: 'Supplier not found',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        delete: {
          tags: ['Suppliers'],
          summary: 'Delete supplier by id',
          description: 'Delete a supplier. (Role: ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the supplier',
            },
          ],
          responses: {
            200: {
              description: 'Supplier deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: { _id: { type: 'string', example: '67f1234567890abcde123456' } },
                      },
                    },
                    required: ['success', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid supplier id',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: {
              description: 'Supplier not found',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/products': {
        post: {
          tags: ['Products'],
          summary: 'Create product',
          description: 'Create a product in the catalog. (Roles: ADMIN, WAREHOUSE)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateProductRequest' },
                examples: {
                  createProduct: {
                    value: { name: 'LED Monitor 24"', sku: 'mon-led-24', price: 199.99 },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Product created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Product created' },
                      data: { $ref: '#/components/schemas/Product' },
                    },
                    required: ['success', 'message', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            409: {
              description: 'Duplicate SKU',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    skuExists: { value: { success: false, message: 'SKU already exists' } },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        get: {
          tags: ['Products'],
          summary: 'List products',
          description:
            'Retrieve all products, sorted by creation date descending. (Roles: ADMIN, WAREHOUSE)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of products',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Product' },
                      },
                    },
                    required: ['success', 'data'],
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
      '/api/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by id',
          description: 'Retrieve one product by MongoDB ObjectId. (Roles: ADMIN, WAREHOUSE)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the product',
              example: '67f1234567890abcde123456',
            },
          ],
          responses: {
            200: {
              description: 'Product found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Product' },
                    },
                    required: ['success', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid product id',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    invalidId: { value: { success: false, message: 'Invalid product id' } },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: {
              description: 'Product not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    notFound: { value: { success: false, message: 'Product not found' } },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        put: {
          tags: ['Products'],
          summary: 'Update product by id',
          description: 'Update product fields. (Roles: ADMIN, WAREHOUSE)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the product',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProductRequest' },
                examples: { updateProduct: { value: { price: 249.99 } } },
              },
            },
          },
          responses: {
            200: {
              description: 'Product updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Product updated' },
                      data: { $ref: '#/components/schemas/Product' },
                    },
                    required: ['success', 'message', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid product id or validation error',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: {
              description: 'Product not found',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            409: {
              description: 'Duplicate SKU',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    skuExists: { value: { success: false, message: 'SKU already exists' } },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete product by id',
          description: 'Delete a product. (Role: ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the product',
            },
          ],
          responses: {
            200: {
              description: 'Product deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Product deleted' },
                    },
                    required: ['success', 'message'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid product id',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: {
              description: 'Product not found',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints (ADMIN only)' },
      { name: 'Products', description: 'Product catalog endpoints' },
      { name: 'Suppliers', description: 'Supplier management endpoints' },
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

        Supplier: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67f1234567890abcde123456' },
            name: { type: 'string', example: 'Acme Supplies Ltd' },
            phone: { type: 'string', example: '+1-555-0100' },
            address: { type: 'string', example: '123 Industrial Ave, Cairo' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['_id', 'name', 'phone', 'address'],
        },
        CreateSupplierRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 3, example: 'Acme Supplies Ltd' },
            phone: { type: 'string', example: '+1-555-0100' },
            address: { type: 'string', example: '123 Industrial Ave, Cairo' },
          },
          required: ['name', 'phone', 'address'],
        },
        UpdateSupplierRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 3, example: 'Acme Supplies Ltd' },
            phone: { type: 'string', example: '+1-555-0100' },
            address: { type: 'string', example: '123 Industrial Ave, Cairo' },
          },
          additionalProperties: false,
        },

        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67f1234567890abcde123456' },
            name: { type: 'string', example: 'LED Monitor 24"' },
            sku: { type: 'string', example: 'MON-LED-24' },
            price: { type: 'number', example: 199.99 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['_id', 'name', 'sku', 'price'],
        },
        CreateProductRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'LED Monitor 24"' },
            sku: { type: 'string', example: 'MON-LED-24' },
            price: { type: 'number', example: 199.99 },
          },
          required: ['name', 'sku', 'price'],
        },
        UpdateProductRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'LED Monitor 27"' },
            sku: { type: 'string', example: 'MON-LED-27' },
            price: { type: 'number', example: 249.99 },
          },
          additionalProperties: false,
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
  apis: [
    './Modules/AUTH/*.js',
    './Modules/Users/*.js',
    './Modules/Products/*.js',
    './Modules/Suppliers/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;