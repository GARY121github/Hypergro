import { SwaggerOptions } from 'swagger-ui-express';

export const swaggerOptions: SwaggerOptions = {
  openapi: '3.0.0',
  info: {
    title: 'Property Listing API',
    version: '1.0.0',
    description: 'API documentation for the Property Listing System',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password',
          },
          name: {
            type: 'string',
            description: 'User full name',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            description: 'User role',
          },
        },
        required: ['email', 'password', 'name'],
      },
      Property: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Property ID',
          },
          title: {
            type: 'string',
            description: 'Property title',
          },
          description: {
            type: 'string',
            description: 'Property description',
          },
          price: {
            type: 'number',
            description: 'Property price',
          },
          location: {
            type: 'object',
            properties: {
              address: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              zipCode: { type: 'string' },
            },
          },
          features: {
            type: 'array',
            items: { type: 'string' },
            description: 'Property features',
          },
          status: {
            type: 'string',
            enum: ['available', 'sold', 'rented'],
            description: 'Property status',
          },
        },
        required: ['title', 'price', 'location'],
      },
      Recommendation: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Recommendation ID',
          },
          sender: {
            type: 'string',
            description: 'User ID of the sender',
          },
          receiver: {
            type: 'string',
            description: 'User ID of the receiver',
          },
          property: {
            type: 'string',
            description: 'Property ID being recommended',
          },
          message: {
            type: 'string',
            description: 'Optional message with the recommendation',
          },
          status: {
            type: 'string',
            enum: ['pending', 'viewed', 'saved', 'rejected'],
            description: 'Current status of the recommendation',
          },
        },
        required: ['sender', 'receiver', 'property'],
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          status: { type: 'number' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/User',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Get user profile',
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/properties': {
      get: {
        tags: ['Properties'],
        summary: 'Get all properties',
        parameters: [
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['available', 'sold', 'rented'],
            },
            description: 'Filter by status',
          },
          {
            in: 'query',
            name: 'minPrice',
            schema: { type: 'number' },
            description: 'Minimum price',
          },
          {
            in: 'query',
            name: 'maxPrice',
            schema: { type: 'number' },
            description: 'Maximum price',
          },
          {
            in: 'query',
            name: 'city',
            schema: { type: 'string' },
            description: 'Filter by city',
          },
        ],
        responses: {
          '200': {
            description: 'List of properties',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Property',
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Properties'],
        summary: 'Create a new property',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Property',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Property created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Property',
                },
              },
            },
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/properties/{id}': {
      get: {
        tags: ['Properties'],
        summary: 'Get a property by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Property ID',
          },
        ],
        responses: {
          '200': {
            description: 'Property found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Property',
                },
              },
            },
          },
          '404': {
            description: 'Property not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Properties'],
        summary: 'Update a property',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Property ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Property',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Property updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Property',
                },
              },
            },
          },
          '404': {
            description: 'Property not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Properties'],
        summary: 'Delete a property',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Property ID',
          },
        ],
        responses: {
          '204': {
            description: 'Property deleted successfully',
          },
          '404': {
            description: 'Property not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/favorites': {
      get: {
        tags: ['Favorites'],
        summary: 'Get user\'s favorite properties',
        responses: {
          '200': {
            description: 'List of favorite properties',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Property',
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/favorites/{propertyId}': {
      post: {
        tags: ['Favorites'],
        summary: 'Add property to favorites',
        parameters: [
          {
            in: 'path',
            name: 'propertyId',
            required: true,
            schema: { type: 'string' },
            description: 'Property ID',
          },
        ],
        responses: {
          '200': {
            description: 'Property added to favorites',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Property',
                },
              },
            },
          },
          '404': {
            description: 'Property not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Favorites'],
        summary: 'Remove property from favorites',
        parameters: [
          {
            in: 'path',
            name: 'propertyId',
            required: true,
            schema: { type: 'string' },
            description: 'Property ID',
          },
        ],
        responses: {
          '204': {
            description: 'Property removed from favorites',
          },
          '404': {
            description: 'Property not found in favorites',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/recommendations': {
      get: {
        tags: ['Recommendations'],
        summary: 'Get all recommendations',
        parameters: [
          {
            in: 'query',
            name: 'status',
            schema: {
              type: 'string',
              enum: ['pending', 'viewed', 'saved', 'rejected'],
            },
            description: 'Filter by status',
          },
        ],
        responses: {
          '200': {
            description: 'List of recommendations',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Recommendation',
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Recommendations'],
        summary: 'Create a new recommendation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  receiver: {
                    type: 'string',
                    description: 'User ID of the receiver',
                  },
                  property: {
                    type: 'string',
                    description: 'Property ID being recommended',
                  },
                  message: {
                    type: 'string',
                    description: 'Optional message',
                  },
                },
                required: ['receiver', 'property'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Recommendation created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Recommendation',
                },
              },
            },
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/api/recommendations/{id}': {
      get: {
        tags: ['Recommendations'],
        summary: 'Get a recommendation by ID',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Recommendation ID',
          },
        ],
        responses: {
          '200': {
            description: 'Recommendation found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Recommendation',
                },
              },
            },
          },
          '404': {
            description: 'Recommendation not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Recommendations'],
        summary: 'Update recommendation status',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Recommendation ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['viewed', 'saved', 'rejected'],
                    description: 'New status',
                  },
                },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Recommendation updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Recommendation',
                },
              },
            },
          },
          '404': {
            description: 'Recommendation not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Recommendations'],
        summary: 'Delete a recommendation',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Recommendation ID',
          },
        ],
        responses: {
          '204': {
            description: 'Recommendation deleted successfully',
          },
          '404': {
            description: 'Recommendation not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API health',
        security: [],
        responses: {
          '200': {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}; 