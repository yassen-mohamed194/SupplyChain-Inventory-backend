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
          parameters: [
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 10 },
              description: 'Number of items per page',
            },
          ],
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
                      pagination: { $ref: '#/components/schemas/PaginationMeta' },
                    },
                    required: ['success', 'data', 'pagination'],
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
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'List all users',
          description:
            'ADMIN-only endpoint to retrieve all users, sorted by creation date descending.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 10 },
              description: 'Number of items per page',
            },
          ],
          responses: {
            200: {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' },
                      },
                      pagination: { $ref: '#/components/schemas/PaginationMeta' },
                    },
                    required: ['success', 'data', 'pagination'],
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
          parameters: [
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 10 },
              description: 'Number of items per page',
            },
          ],
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
                      pagination: { $ref: '#/components/schemas/PaginationMeta' },
                    },
                    required: ['success', 'data', 'pagination'],
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

      '/api/inventory': {
        get: {
          tags: ['Inventory'],
          summary: 'List all inventory logs',
          description:
            'Retrieve all inventory movement logs sorted by latest first. (Roles: ADMIN, WAREHOUSE)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Inventory logs fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/InventoryLog' },
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
      '/api/inventory/{productId}': {
        get: {
          tags: ['Inventory'],
          summary: 'List inventory logs by product',
          description:
            'Retrieve all inventory logs for a specific product sorted by latest first. (Roles: ADMIN, WAREHOUSE)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'productId',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the product',
              example: '67f1234567890abcde123456',
            },
          ],
          responses: {
            200: {
              description: 'Product inventory logs fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/InventoryLog' },
                      },
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
                    invalidProductId: {
                      value: { success: false, message: 'Invalid product id' },
                    },
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
      '/api/inventory/stock/{productId}': {
        get: {
          tags: ['Inventory'],
          summary: 'Get current stock by product',
          description:
            'Calculate available stock from inventory IN/OUT movements for one product. (Roles: ADMIN, WAREHOUSE)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'productId',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the product',
              example: '67f1234567890abcde123456',
            },
          ],
          responses: {
            200: {
              description: 'Product stock fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/ProductStockResponse' },
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
                    invalidProductId: {
                      value: { success: false, message: 'Invalid product id' },
                    },
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

      '/api/orders': {
        post: {
          tags: ['Orders'],
          summary: 'Create order',
          description:
            'Create a new customer order with status PENDING and calculated totalAmount. (Roles: ADMIN, ACCOUNTANT)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateOrderRequest' },
                examples: {
                  createOrder: {
                    value: {
                      customerName: 'John Doe',
                      items: [
                        {
                          productId: '67f1234567890abcde123456',
                          quantity: 2,
                          price: 100,
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Order created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Order created successfully' },
                      data: { $ref: '#/components/schemas/Order' },
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
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        get: {
          tags: ['Orders'],
          summary: 'List all orders',
          description: 'Retrieve all orders sorted by latest first. (Roles: ADMIN, ACCOUNTANT)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 10 },
              description: 'Number of items per page',
            },
          ],
          responses: {
            200: {
              description: 'Orders fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Orders fetched successfully' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Order' },
                      },
                      pagination: { $ref: '#/components/schemas/PaginationMeta' },
                    },
                    required: ['success', 'message', 'data', 'pagination'],
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
      '/api/orders/{id}': {
        get: {
          tags: ['Orders'],
          summary: 'Get order by id',
          description: 'Retrieve one order by MongoDB ObjectId. (Roles: ADMIN, ACCOUNTANT)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the order',
              example: '67f1234567890abcde123456',
            },
          ],
          responses: {
            200: {
              description: 'Order fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Order fetched successfully' },
                      data: { $ref: '#/components/schemas/Order' },
                    },
                    required: ['success', 'message', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid order id',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    invalidOrderId: {
                      value: { success: false, message: 'Invalid order id', data: null },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: {
              description: 'Order not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    orderNotFound: {
                      value: { success: false, message: 'Order not found', data: null },
                    },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
      '/api/orders/{id}/confirm': {
        put: {
          tags: ['Orders'],
          summary: 'Confirm order and decrement stock',
          description:
            'Confirms a PENDING order after stock check and creates OUT inventory logs for each item. (Roles: ADMIN, ACCOUNTANT)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the order',
              example: '67f1234567890abcde123456',
            },
          ],
          responses: {
            200: {
              description: 'Order confirmed successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Order confirmed successfully' },
                      data: { $ref: '#/components/schemas/Order' },
                    },
                    required: ['success', 'message', 'data'],
                  },
                },
              },
            },
            400: {
              description:
                'Invalid order id, invalid product id, already confirmed, or insufficient stock',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    orderAlreadyConfirmed: {
                      value: {
                        success: false,
                        message: 'Order already confirmed',
                        data: null,
                      },
                    },
                    insufficientStock: {
                      value: {
                        success: false,
                        message: 'Insufficient stock',
                        data: {
                          productId: '67f1234567890abcde123456',
                          requested: 5,
                          available: 2,
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: {
              description: 'Order not found',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },

      '/api/purchases': {
        post: {
          tags: ['Purchases'],
          summary: 'Create purchase',
          description:
            'Create a supplier purchase with status PENDING and calculated totalAmount. (Roles: ADMIN, ACCOUNTANT)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreatePurchaseRequest' },
                examples: {
                  createPurchase: {
                    value: {
                      supplierId: '67f1234567890abcde123450',
                      items: [
                        {
                          productId: '67f1234567890abcde123456',
                          quantity: 10,
                          price: 50,
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Purchase created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Purchase created successfully' },
                      data: { $ref: '#/components/schemas/Purchase' },
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
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
        get: {
          tags: ['Purchases'],
          summary: 'List all purchases',
          description: 'Retrieve all purchases sorted by latest first. (Roles: ADMIN, ACCOUNTANT)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 10 },
              description: 'Number of items per page',
            },
          ],
          responses: {
            200: {
              description: 'Purchases fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Purchases fetched successfully' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Purchase' },
                      },
                      pagination: { $ref: '#/components/schemas/PaginationMeta' },
                    },
                    required: ['success', 'message', 'data', 'pagination'],
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
      '/api/purchases/supplier/{supplierId}': {
        get: {
          tags: ['Purchases'],
          summary: 'Get purchases by supplier id',
          description:
            'Retrieve purchase history for a specific supplier sorted by latest first. (Roles: ADMIN, ACCOUNTANT)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'supplierId',
              required: true,
              schema: { type: 'string' },
              description: 'Supplier ID',
              example: '67f1234567890abcde123460',
            },
          ],
          responses: {
            200: {
              description: 'Supplier purchases fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            totalAmount: { type: 'number', example: 500 },
                            totalQuantity: { type: 'number', example: 10 },
                            status: {
                              type: 'string',
                              enum: ['PENDING', 'RECEIVED'],
                              example: 'PENDING',
                            },
                            createdAt: { type: 'string', format: 'date-time' },
                          },
                          required: ['totalAmount', 'totalQuantity', 'status', 'createdAt'],
                        },
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
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    invalidSupplierId: {
                      value: { success: false, message: 'Invalid supplier id', data: null },
                    },
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
      '/api/purchases/{id}': {
        get: {
          tags: ['Purchases'],
          summary: 'Get purchase by id',
          description: 'Retrieve one purchase by MongoDB ObjectId. (Roles: ADMIN, ACCOUNTANT)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the purchase',
              example: '67f1234567890abcde123456',
            },
          ],
          responses: {
            200: {
              description: 'Purchase fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Purchase fetched successfully' },
                      data: { $ref: '#/components/schemas/Purchase' },
                    },
                    required: ['success', 'message', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid purchase id',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    invalidPurchaseId: {
                      value: { success: false, message: 'Invalid purchase id', data: null },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: {
              description: 'Purchase not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    purchaseNotFound: {
                      value: { success: false, message: 'Purchase not found', data: null },
                    },
                  },
                },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
      '/api/purchases/{id}/status': {
        put: {
          tags: ['Purchases'],
          summary: 'Update purchase status',
          description:
            'Update purchase status to PENDING or RECEIVED. When set to RECEIVED, IN inventory logs are created for each item. (Roles: ADMIN, WAREHOUSE)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
              description: 'MongoDB ObjectId of the purchase',
              example: '67f1234567890abcde123456',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdatePurchaseStatusRequest' },
                examples: {
                  markReceived: { value: { status: 'RECEIVED' } },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Purchase status updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Purchase status updated successfully' },
                      data: { $ref: '#/components/schemas/Purchase' },
                    },
                    required: ['success', 'message', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid purchase id, invalid status, or purchase already received',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                  examples: {
                    alreadyReceived: {
                      value: {
                        success: false,
                        message: 'Purchase already marked as RECEIVED',
                        data: null,
                      },
                    },
                    invalidStatus: {
                      value: {
                        success: false,
                        message: 'Invalid status',
                      },
                    },
                  },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            404: {
              description: 'Purchase not found',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError' } },
              },
            },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
      '/api/dashboard/purchases/monthly': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get monthly purchase totals',
          description:
            'Returns purchase totals grouped by month for a given year (defaults to current UTC year). (Role: ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'year',
              required: false,
              schema: {
                type: 'integer',
                minimum: 2000,
                maximum: 2100,
              },
              description: 'Target year in UTC. If omitted, current UTC year is used.',
              example: 2026,
            },
          ],
          responses: {
            200: {
              description: 'Monthly purchases fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Monthly purchases fetched successfully' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/DashboardMonthlyTotal' },
                      },
                    },
                    required: ['success', 'message', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid year query parameter',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiErrorWithData' },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
      '/api/dashboard/orders/monthly': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get monthly order totals',
          description:
            'Returns order totals grouped by month for a given year (defaults to current UTC year). (Role: ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'year',
              required: false,
              schema: {
                type: 'integer',
                minimum: 2000,
                maximum: 2100,
              },
              description: 'Target year in UTC. If omitted, current UTC year is used.',
              example: 2026,
            },
          ],
          responses: {
            200: {
              description: 'Monthly orders fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Monthly orders fetched successfully' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/DashboardMonthlyTotal' },
                      },
                    },
                    required: ['success', 'message', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid year query parameter',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiErrorWithData' },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
            500: { $ref: '#/components/responses/InternalServerError' },
          },
        },
      },
      '/api/dashboard/top-products': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get top sold products',
          description:
            'Returns top 5 sold products based on OUT inventory movements. (Role: ADMIN)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Top products fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Top products fetched successfully' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/DashboardTopProduct' },
                      },
                    },
                    required: ['success', 'message', 'data'],
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
      '/api/dashboard/low-stock': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get low stock products',
          description:
            'Returns products with computed stock below 10 units based on IN/OUT inventory movements. (Role: ADMIN)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Low stock products fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Low stock products fetched successfully' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/DashboardLowStockProduct' },
                      },
                    },
                    required: ['success', 'message', 'data'],
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
      '/api/dashboard/finance/summary': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get finance summary',
          description:
            'Returns yearly totals (revenue, spent, net profit) and monthly financial breakdown. (Role: ADMIN)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'year',
              required: false,
              schema: {
                type: 'integer',
                minimum: 2000,
                maximum: 2100,
              },
              description: 'Target year in UTC. If omitted, current UTC year is used.',
              example: 2026,
            },
          ],
          responses: {
            200: {
              description: 'Finance summary fetched successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Finance summary fetched successfully' },
                      data: { $ref: '#/components/schemas/DashboardFinanceSummary' },
                    },
                    required: ['success', 'message', 'data'],
                  },
                },
              },
            },
            400: {
              description: 'Invalid year query parameter',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiErrorWithData' },
                },
              },
            },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
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
      { name: 'Inventory', description: 'Inventory logs and stock endpoints' },
      { name: 'Orders', description: 'Sales order endpoints' },
      { name: 'Purchases', description: 'Purchase order endpoints' },
      { name: 'Dashboard', description: 'Dashboard analytics and summary endpoints' },
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
        ApiErrorWithData: {
          allOf: [
            { $ref: '#/components/schemas/ApiError' },
            {
              type: 'object',
              properties: {
                data: {
                  oneOf: [{ type: 'object' }, { type: 'array' }, { type: 'string' }, { type: 'null' }],
                  example: {
                    formErrors: [],
                    fieldErrors: {
                      year: ['Year must be greater than or equal to 2000'],
                    },
                  },
                },
              },
            },
          ],
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

        InventoryLog: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67f1234567890abcde123456' },
            productId: { type: 'string', example: '67f1234567890abcde123450' },
            type: { type: 'string', enum: ['IN', 'OUT'], example: 'IN' },
            quantity: { type: 'number', minimum: 1, example: 10 },
            source: { type: 'string', enum: ['PURCHASE', 'ORDER'], example: 'PURCHASE' },
            referenceId: { type: 'string', example: '67f1234567890abcde123499' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['productId', 'type', 'quantity', 'source', 'referenceId'],
        },
        ProductStockResponse: {
          type: 'object',
          properties: {
            productId: { type: 'string', example: '67f1234567890abcde123450' },
            stock: { type: 'number', example: 25 },
          },
          required: ['productId', 'stock'],
        },
        OrderItem: {
          type: 'object',
          properties: {
            productId: { type: 'string', example: '67f1234567890abcde123450' },
            quantity: { type: 'number', minimum: 1, example: 2 },
            price: { type: 'number', minimum: 0.01, example: 100 },
          },
          required: ['productId', 'quantity', 'price'],
          additionalProperties: false,
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67f1234567890abcde123456' },
            customerName: { type: 'string', example: 'John Doe' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' },
            },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED'], example: 'PENDING' },
            totalAmount: { type: 'number', minimum: 0, example: 200 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['_id', 'customerName', 'items', 'status', 'totalAmount'],
        },
        CreateOrderRequest: {
          type: 'object',
          properties: {
            customerName: { type: 'string', minLength: 1, example: 'John Doe' },
            items: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/OrderItem' },
            },
          },
          required: ['customerName', 'items'],
          additionalProperties: false,
        },
        PurchaseItem: {
          type: 'object',
          properties: {
            productId: { type: 'string', example: '67f1234567890abcde123450' },
            quantity: { type: 'number', minimum: 1, example: 10 },
            price: { type: 'number', minimum: 0.01, example: 50 },
          },
          required: ['productId', 'quantity', 'price'],
          additionalProperties: false,
        },
        Purchase: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '67f1234567890abcde123456' },
            supplierId: { type: 'string', example: '67f1234567890abcde123460' },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/PurchaseItem' },
            },
            status: { type: 'string', enum: ['PENDING', 'RECEIVED'], example: 'PENDING' },
            totalAmount: { type: 'number', minimum: 0, example: 500 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['_id', 'supplierId', 'items', 'status', 'totalAmount'],
        },
        CreatePurchaseRequest: {
          type: 'object',
          properties: {
            supplierId: { type: 'string', example: '67f1234567890abcde123460' },
            items: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/PurchaseItem' },
            },
          },
          required: ['supplierId', 'items'],
          additionalProperties: false,
        },
        UpdatePurchaseStatusRequest: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['PENDING', 'RECEIVED'], example: 'RECEIVED' },
          },
          required: ['status'],
          additionalProperties: false,
        },
        DashboardMonthlyTotal: {
          type: 'object',
          properties: {
            month: {
              type: 'string',
              enum: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              example: 'Jan',
            },
            total: { type: 'number', minimum: 0, example: 12000 },
          },
          required: ['month', 'total'],
        },
        DashboardTopProduct: {
          type: 'object',
          properties: {
            productId: { type: 'string', example: '67f1234567890abcde123450' },
            productName: { type: 'string', example: 'LED Monitor 24"' },
            totalSold: { type: 'number', minimum: 0, example: 95 },
          },
          required: ['productId', 'productName', 'totalSold'],
        },
        DashboardLowStockProduct: {
          type: 'object',
          properties: {
            productId: { type: 'string', example: '67f1234567890abcde123450' },
            productName: { type: 'string', example: 'Wireless Mouse' },
            stock: { type: 'number', example: 4 },
          },
          required: ['productId', 'productName', 'stock'],
        },
        DashboardFinanceMonthly: {
          type: 'object',
          properties: {
            month: {
              type: 'string',
              enum: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              example: 'Jan',
            },
            revenue: { type: 'number', minimum: 0, example: 18000 },
            spent: { type: 'number', minimum: 0, example: 12000 },
            profit: { type: 'number', example: 6000 },
          },
          required: ['month', 'revenue', 'spent', 'profit'],
        },
        DashboardFinanceSummary: {
          type: 'object',
          properties: {
            totalRevenue: { type: 'number', minimum: 0, example: 150000 },
            totalSpent: { type: 'number', minimum: 0, example: 98000 },
            netProfit: { type: 'number', example: 52000 },
            monthly: {
              type: 'array',
              items: { $ref: '#/components/schemas/DashboardFinanceMonthly' },
            },
          },
          required: ['totalRevenue', 'totalSpent', 'netProfit', 'monthly'],
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            pages: { type: 'integer', example: 10 },
          },
          required: ['page', 'limit', 'total', 'pages'],
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
    './Modules/Inventory/*.js',
    './Modules/Order/*.js',
    './Modules/Purchase/*.js',
    './Modules/Dashboard/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;