import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../src/app.js';
import { initDatabase, closeDatabase, getDatabase } from '../../src/config/database.js';

describe('Task Routes Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    // Initialize in-memory database for testing
    initDatabase({ filename: ':memory:', inMemory: true });
    app = createApp();
  });

  afterAll(() => {
    closeDatabase();
  });

  beforeEach(() => {
    // Clear all tasks before each test
    const db = getDatabase();
    db.exec('DELETE FROM tasks');
  });

  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all tasks', async () => {
      // Create some tasks first
      await request(app).post('/api/tasks').send({ title: 'Task 1' });
      await request(app).post('/api/tasks').send({ title: 'Task 2' });

      const response = await request(app)
        .get('/api/tasks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('id');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by ID', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task', description: 'Test Description' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Test Task');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.status).toBe('pending');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/tasks/9999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toBe('Invalid task ID');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task with minimal data', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'New Task' })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('New Task');
      expect(response.body.status).toBe('pending');
      expect(response.body.description).toBeNull();
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create a task with all fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Complete Task',
          description: 'With description',
          status: 'in_progress',
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.title).toBe('Complete Task');
      expect(response.body.description).toBe('With description');
      expect(response.body.status).toBe('in_progress');
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Title is required');
    });

    it('should return 400 when title is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '   ' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Title is required');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', status: 'invalid_status' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.error).toContain('Invalid status');
    });

    it('should trim whitespace from title and description', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '  Trimmed Title  ', description: '  Trimmed Desc  ' })
        .expect(201);

      expect(response.body.title).toBe('Trimmed Title');
      expect(response.body.description).toBe('Trimmed Desc');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task title', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Original Title' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Title' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should update task status', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });

    it('should update task description', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task', description: 'Original' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ description: 'Updated Description' })
        .expect(200);

      expect(response.body.description).toBe('Updated Description');
    });

    it('should update multiple fields', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Original', status: 'pending' });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          title: 'Updated',
          description: 'New Description',
          status: 'in_progress',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated');
      expect(response.body.description).toBe('New Description');
      expect(response.body.status).toBe('in_progress');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/9999')
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .put('/api/tasks/invalid')
        .send({ title: 'Updated' })
        .expect(400);

      expect(response.body.error).toBe('Invalid task ID');
    });

    it('should return 400 for invalid status', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task' });

      const response = await request(app)
        .put(`/api/tasks/${createResponse.body.id}`)
        .send({ status: 'bad_status' })
        .expect(400);

      expect(response.body.error).toContain('Invalid status');
    });

    it('should return 400 for empty title', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task' });

      const response = await request(app)
        .put(`/api/tasks/${createResponse.body.id}`)
        .send({ title: '' })
        .expect(400);

      expect(response.body.error).toContain('non-empty string');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'To Delete' });

      const taskId = createResponse.body.id;

      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .expect(204);

      // Verify task is deleted
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .expect(404);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/tasks/9999')
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .delete('/api/tasks/invalid')
        .expect(400);

      expect(response.body.error).toBe('Invalid task ID');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown/route')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.error).toBe('Not Found');
    });
  });
});

