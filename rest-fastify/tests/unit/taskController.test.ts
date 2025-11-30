import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { DataSource } from 'typeorm';
import { TaskController } from '../../src/controllers/taskController.js';
import { Task } from '../../src/entities/Task.js';
import { createTestDataSource } from '../../src/config/database.js';

describe('TaskController', () => {
  let dataSource: DataSource;
  let controller: TaskController;

  beforeAll(async () => {
    dataSource = createTestDataSource();
    await dataSource.initialize();
    controller = new TaskController(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    // Clear all tasks before each test
    await dataSource.getRepository(Task).clear();
  });

  describe('createTask', () => {
    it('should create a task with only title', async () => {
      const result = await controller.createTask({ title: 'Test Task' });

      expect(result).toMatchObject({
        title: 'Test Task',
        description: null,
        status: 'pending',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create a task with all fields', async () => {
      const result = await controller.createTask({
        title: 'Complete Task',
        description: 'This is a description',
        status: 'in_progress',
      });

      expect(result).toMatchObject({
        title: 'Complete Task',
        description: 'This is a description',
        status: 'in_progress',
      });
    });

    it('should default status to pending', async () => {
      const result = await controller.createTask({ title: 'Default Status' });

      expect(result.status).toBe('pending');
    });
  });

  describe('getAllTasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const result = await controller.getAllTasks();

      expect(result).toEqual([]);
    });

    it('should return all tasks', async () => {
      await controller.createTask({ title: 'First Task' });
      await controller.createTask({ title: 'Second Task' });
      await controller.createTask({ title: 'Third Task' });

      const result = await controller.getAllTasks();

      expect(result).toHaveLength(3);
      const titles = result.map(t => t.title);
      expect(titles).toContain('First Task');
      expect(titles).toContain('Second Task');
      expect(titles).toContain('Third Task');
    });
  });

  describe('getTaskById', () => {
    it('should return a task when it exists', async () => {
      const created = await controller.createTask({ title: 'Find Me' });

      const result = await controller.getTaskById(created.id);

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Find Me');
    });

    it('should return null when task does not exist', async () => {
      const result = await controller.getTaskById(9999);

      expect(result).toBeNull();
    });
  });

  describe('updateTask', () => {
    it('should update task title', async () => {
      const created = await controller.createTask({ title: 'Original Title' });

      const result = await controller.updateTask(created.id, { title: 'Updated Title' });

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Updated Title');
    });

    it('should update task description', async () => {
      const created = await controller.createTask({ title: 'Task' });

      const result = await controller.updateTask(created.id, { description: 'New description' });

      expect(result?.description).toBe('New description');
    });

    it('should update task status', async () => {
      const created = await controller.createTask({ title: 'Task' });

      const result = await controller.updateTask(created.id, { status: 'completed' });

      expect(result?.status).toBe('completed');
    });

    it('should update multiple fields at once', async () => {
      const created = await controller.createTask({ title: 'Task' });

      const result = await controller.updateTask(created.id, {
        title: 'New Title',
        description: 'New Description',
        status: 'in_progress',
      });

      expect(result).toMatchObject({
        title: 'New Title',
        description: 'New Description',
        status: 'in_progress',
      });
    });

    it('should return null when task does not exist', async () => {
      const result = await controller.updateTask(9999, { title: 'New Title' });

      expect(result).toBeNull();
    });

    it('should preserve unchanged fields', async () => {
      const created = await controller.createTask({
        title: 'Original',
        description: 'Original Description',
        status: 'pending',
      });

      const result = await controller.updateTask(created.id, { status: 'completed' });

      expect(result?.title).toBe('Original');
      expect(result?.description).toBe('Original Description');
      expect(result?.status).toBe('completed');
    });
  });

  describe('deleteTask', () => {
    it('should delete an existing task', async () => {
      const created = await controller.createTask({ title: 'Delete Me' });

      const result = await controller.deleteTask(created.id);

      expect(result).toBe(true);
      
      const found = await controller.getTaskById(created.id);
      expect(found).toBeNull();
    });

    it('should return false when task does not exist', async () => {
      const result = await controller.deleteTask(9999);

      expect(result).toBe(false);
    });
  });
});

