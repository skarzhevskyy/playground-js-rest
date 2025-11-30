import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Task Routes Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clear all tasks before each test
    await prisma.task.deleteMany();
  });

  describe('GET /tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app.getHttpServer()).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all tasks', async () => {
      // Create tasks directly in database
      await prisma.task.createMany({
        data: [
          { title: 'Task 1', status: 'pending' },
          { title: 'Task 2', status: 'completed' },
        ],
      });

      const response = await request(app.getHttpServer()).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /tasks/:id', () => {
    it('should return a task by id', async () => {
      const task = await prisma.task.create({
        data: { title: 'Test Task', status: 'pending' },
      });

      const response = await request(app.getHttpServer()).get(`/tasks/${task.id}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app.getHttpServer()).get('/tasks/9999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task with minimal data', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'New Task' });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('New Task');
      expect(response.body.description).toBeNull();
      expect(response.body.status).toBe('pending');
      expect(response.body.id).toBeDefined();
    });

    it('should create a new task with all fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Complete Task',
          description: 'A description',
          status: 'in_progress',
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Complete Task');
      expect(response.body.description).toBe('A description');
      expect(response.body.status).toBe('in_progress');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({ description: 'No title' });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Task', status: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /tasks/:id', () => {
    it('should update a task', async () => {
      const task = await prisma.task.create({
        data: { title: 'Original', status: 'pending' },
      });

      const response = await request(app.getHttpServer())
        .put(`/tasks/${task.id}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated');
    });

    it('should update multiple fields', async () => {
      const task = await prisma.task.create({
        data: { title: 'Original', status: 'pending' },
      });

      const response = await request(app.getHttpServer())
        .put(`/tasks/${task.id}`)
        .send({
          title: 'Updated Title',
          description: 'New Description',
          status: 'completed',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.description).toBe('New Description');
      expect(response.body.status).toBe('completed');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app.getHttpServer())
        .put('/tasks/9999')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 400 for invalid status', async () => {
      const task = await prisma.task.create({
        data: { title: 'Task', status: 'pending' },
      });

      const response = await request(app.getHttpServer())
        .put(`/tasks/${task.id}`)
        .send({ status: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('should delete a task', async () => {
      const task = await prisma.task.create({
        data: { title: 'Delete Me', status: 'pending' },
      });

      const response = await request(app.getHttpServer()).delete(`/tasks/${task.id}`);

      expect(response.status).toBe(204);

      // Verify deletion
      const found = await prisma.task.findUnique({ where: { id: task.id } });
      expect(found).toBeNull();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app.getHttpServer()).delete('/tasks/9999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer()).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
