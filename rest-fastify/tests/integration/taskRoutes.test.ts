import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { DataSource } from 'typeorm';
import { buildApp } from '../../src/app.js';
import { createTestDataSource, initializeDatabase } from '../../src/config/database.js';
import { Task } from '../../src/entities/Task.js';

describe('Task Routes Integration Tests', () => {
  let app: FastifyInstance;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = createTestDataSource();
    await initializeDatabase(dataSource);
    app = await buildApp({ dataSource });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await dataSource.getRepository(Task).clear();
  });

  describe('GET /tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/tasks',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });

    it('should return all tasks', async () => {
      // Create tasks directly in database
      const taskRepo = dataSource.getRepository(Task);
      await taskRepo.save({ title: 'Task 1', status: 'pending' });
      await taskRepo.save({ title: 'Task 2', status: 'completed' });

      const response = await app.inject({
        method: 'GET',
        url: '/tasks',
      });

      expect(response.statusCode).toBe(200);
      const tasks = response.json();
      expect(tasks).toHaveLength(2);
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a task by id', async () => {
      const taskRepo = dataSource.getRepository(Task);
      const task = await taskRepo.save({ title: 'Test Task', status: 'pending' });

      const response = await app.inject({
        method: 'GET',
        url: `/tasks/${task.id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/tasks/9999',
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toBe('Task not found');
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task with minimal data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: { title: 'New Task' },
      });

      expect(response.statusCode).toBe(201);
      const task = response.json();
      expect(task.title).toBe('New Task');
      expect(task.description).toBeNull();
      expect(task.status).toBe('pending');
      expect(task.id).toBeDefined();
    });

    it('should create a new task with all fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          title: 'Complete Task',
          description: 'A description',
          status: 'in_progress',
        },
      });

      expect(response.statusCode).toBe(201);
      const task = response.json();
      expect(task.title).toBe('Complete Task');
      expect(task.description).toBe('A description');
      expect(task.status).toBe('in_progress');
    });

    it('should return 400 for missing title', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: { description: 'No title' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for invalid status', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: { title: 'Task', status: 'invalid' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update a task', async () => {
      const taskRepo = dataSource.getRepository(Task);
      const task = await taskRepo.save({ title: 'Original', status: 'pending' });

      const response = await app.inject({
        method: 'PUT',
        url: `/tasks/${task.id}`,
        payload: { title: 'Updated' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json().title).toBe('Updated');
    });

    it('should update multiple fields', async () => {
      const taskRepo = dataSource.getRepository(Task);
      const task = await taskRepo.save({ title: 'Original', status: 'pending' });

      const response = await app.inject({
        method: 'PUT',
        url: `/tasks/${task.id}`,
        payload: {
          title: 'Updated Title',
          description: 'New Description',
          status: 'completed',
        },
      });

      expect(response.statusCode).toBe(200);
      const updated = response.json();
      expect(updated.title).toBe('Updated Title');
      expect(updated.description).toBe('New Description');
      expect(updated.status).toBe('completed');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/tasks/9999',
        payload: { title: 'Updated' },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toBe('Task not found');
    });

    it('should return 400 for invalid status', async () => {
      const taskRepo = dataSource.getRepository(Task);
      const task = await taskRepo.save({ title: 'Task', status: 'pending' });

      const response = await app.inject({
        method: 'PUT',
        url: `/tasks/${task.id}`,
        payload: { status: 'invalid' },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      const taskRepo = dataSource.getRepository(Task);
      const task = await taskRepo.save({ title: 'Delete Me', status: 'pending' });

      const response = await app.inject({
        method: 'DELETE',
        url: `/tasks/${task.id}`,
      });

      expect(response.statusCode).toBe(204);

      // Verify deletion
      const found = await taskRepo.findOneBy({ id: task.id });
      expect(found).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/tasks/9999',
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toBe('Task not found');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
    });
  });
});

