import Fastify, { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { taskRoutes } from './routes/taskRoutes.js';
import { DataSource } from 'typeorm';
import { AppDataSource } from './config/database.js';

export interface AppOptions {
  dataSource?: DataSource;
}

export const buildApp = async (options: AppOptions = {}): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  // Store dataSource in app decorator for access in routes
  const dataSource = options.dataSource || AppDataSource;
  app.decorate('dataSource', dataSource);

  // Register Swagger
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Task Management API',
        description: 'REST API for managing tasks built with Fastify and TypeORM',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Tasks', description: 'Task management endpoints' },
      ],
    },
  });

  // Register Swagger UI
  await app.register(fastifySwaggerUI, {
    routePrefix: '/api-docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Register routes
  await app.register(taskRoutes, { prefix: '/tasks' });

  // Health check endpoint
  app.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
};

// Extend FastifyInstance type to include dataSource
declare module 'fastify' {
  interface FastifyInstance {
    dataSource: DataSource;
  }
}

