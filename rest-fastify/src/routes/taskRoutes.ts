import { FastifyPluginAsync } from 'fastify';
import { TaskController } from '../controllers/taskController.js';

// JSON Schemas for validation and OpenAPI documentation
const taskStatusEnum = { type: 'string', enum: ['pending', 'in_progress', 'completed'] };

const taskSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    description: { type: 'string', nullable: true },
    status: taskStatusEnum,
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

const createTaskSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string' },
    status: taskStatusEnum,
  },
} as const;

const updateTaskSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string' },
    status: taskStatusEnum,
  },
} as const;

const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
  },
} as const;

const idParamSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
  },
  required: ['id'],
} as const;

interface IdParams {
  id: number;
}

interface CreateTaskBody {
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

export const taskRoutes: FastifyPluginAsync = async (fastify) => {
  const controller = new TaskController(fastify.dataSource);

  // GET /tasks - List all tasks
  fastify.get('/', {
    schema: {
      description: 'Get all tasks',
      tags: ['Tasks'],
      response: {
        200: {
          type: 'array',
          items: taskSchema,
        },
      },
    },
  }, async () => {
    return controller.getAllTasks();
  });

  // GET /tasks/:id - Get task by ID
  fastify.get<{ Params: IdParams }>('/:id', {
    schema: {
      description: 'Get a task by ID',
      tags: ['Tasks'],
      params: idParamSchema,
      response: {
        200: taskSchema,
        404: errorSchema,
      },
    },
  }, async (request, reply) => {
    const task = await controller.getTaskById(request.params.id);
    
    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }
    
    return task;
  });

  // POST /tasks - Create a new task
  fastify.post<{ Body: CreateTaskBody }>('/', {
    schema: {
      description: 'Create a new task',
      tags: ['Tasks'],
      body: createTaskSchema,
      response: {
        201: taskSchema,
        400: errorSchema,
      },
    },
  }, async (request, reply) => {
    const task = await controller.createTask(request.body);
    return reply.status(201).send(task);
  });

  // PUT /tasks/:id - Update a task
  fastify.put<{ Params: IdParams; Body: UpdateTaskBody }>('/:id', {
    schema: {
      description: 'Update an existing task',
      tags: ['Tasks'],
      params: idParamSchema,
      body: updateTaskSchema,
      response: {
        200: taskSchema,
        404: errorSchema,
      },
    },
  }, async (request, reply) => {
    const task = await controller.updateTask(request.params.id, request.body);
    
    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }
    
    return task;
  });

  // DELETE /tasks/:id - Delete a task
  fastify.delete<{ Params: IdParams }>('/:id', {
    schema: {
      description: 'Delete a task',
      tags: ['Tasks'],
      params: idParamSchema,
      response: {
        204: {
          type: 'null',
          description: 'Task deleted successfully',
        },
        404: errorSchema,
      },
    },
  }, async (request, reply) => {
    const deleted = await controller.deleteTask(request.params.id);
    
    if (!deleted) {
      return reply.status(404).send({ error: 'Task not found' });
    }
    
    return reply.status(204).send();
  });
};

