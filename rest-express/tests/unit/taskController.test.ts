import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { Request, Response } from 'express';
import { taskController } from '../../src/controllers/taskController.js';
import { TaskModel, Task } from '../../src/models/Task.js';

// Mock the TaskModel
vi.mock('../../src/models/Task.js', () => ({
  TaskModel: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('TaskController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: Mock;
  let statusMock: Mock;
  let sendMock: Mock;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    jsonMock = vi.fn();
    sendMock = vi.fn();
    statusMock = vi.fn().mockReturnThis();

    mockRequest = {
      params: {},
      body: {},
    };

    mockResponse = {
      json: jsonMock,
      status: statusMock,
      send: sendMock,
    };
  });

  describe('getAll', () => {
    it('should return all tasks', () => {
      const tasks = [mockTask];
      (TaskModel.findAll as Mock).mockReturnValue(tasks);

      taskController.getAll(mockRequest as Request, mockResponse as Response);

      expect(TaskModel.findAll).toHaveBeenCalled();
      expect(jsonMock).toHaveBeenCalledWith(tasks);
    });

    it('should return empty array when no tasks exist', () => {
      (TaskModel.findAll as Mock).mockReturnValue([]);

      taskController.getAll(mockRequest as Request, mockResponse as Response);

      expect(jsonMock).toHaveBeenCalledWith([]);
    });

    it('should return 500 on error', () => {
      (TaskModel.findAll as Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      taskController.getAll(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to fetch tasks' });
    });
  });

  describe('getById', () => {
    it('should return a task when found', () => {
      mockRequest.params = { id: '1' };
      (TaskModel.findById as Mock).mockReturnValue(mockTask);

      taskController.getById(mockRequest as Request, mockResponse as Response);

      expect(TaskModel.findById).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith(mockTask);
    });

    it('should return 404 when task not found', () => {
      mockRequest.params = { id: '999' };
      (TaskModel.findById as Mock).mockReturnValue(undefined);

      taskController.getById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 400 for invalid ID', () => {
      mockRequest.params = { id: 'invalid' };

      taskController.getById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid task ID' });
    });

    it('should return 500 on error', () => {
      mockRequest.params = { id: '1' };
      (TaskModel.findById as Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      taskController.getById(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to fetch task' });
    });
  });

  describe('create', () => {
    it('should create a task with valid data', () => {
      mockRequest.body = { title: 'New Task', description: 'Description' };
      (TaskModel.create as Mock).mockReturnValue({ ...mockTask, title: 'New Task' });

      taskController.create(mockRequest as Request, mockResponse as Response);

      expect(TaskModel.create).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'Description',
        status: undefined,
      });
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should create a task with status', () => {
      mockRequest.body = { title: 'New Task', status: 'in_progress' };
      (TaskModel.create as Mock).mockReturnValue({ ...mockTask, status: 'in_progress' });

      taskController.create(mockRequest as Request, mockResponse as Response);

      expect(TaskModel.create).toHaveBeenCalledWith({
        title: 'New Task',
        description: undefined,
        status: 'in_progress',
      });
      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should return 400 when title is missing', () => {
      mockRequest.body = { description: 'No title' };

      taskController.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Title is required and must be a non-empty string',
      });
    });

    it('should return 400 when title is empty', () => {
      mockRequest.body = { title: '   ' };

      taskController.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Title is required and must be a non-empty string',
      });
    });

    it('should return 400 for invalid status', () => {
      mockRequest.body = { title: 'Task', status: 'invalid_status' };

      taskController.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid status. Must be one of: pending, in_progress, completed',
      });
    });

    it('should return 500 on error', () => {
      mockRequest.body = { title: 'New Task' };
      (TaskModel.create as Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      taskController.create(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to create task' });
    });
  });

  describe('update', () => {
    it('should update a task with valid data', () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated Task' };
      (TaskModel.update as Mock).mockReturnValue({ ...mockTask, title: 'Updated Task' });

      taskController.update(mockRequest as Request, mockResponse as Response);

      expect(TaskModel.update).toHaveBeenCalledWith(1, { title: 'Updated Task' });
      expect(jsonMock).toHaveBeenCalledWith({ ...mockTask, title: 'Updated Task' });
    });

    it('should update task status', () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'completed' };
      (TaskModel.update as Mock).mockReturnValue({ ...mockTask, status: 'completed' });

      taskController.update(mockRequest as Request, mockResponse as Response);

      expect(TaskModel.update).toHaveBeenCalledWith(1, { status: 'completed' });
    });

    it('should return 404 when task not found', () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { title: 'Updated' };
      (TaskModel.update as Mock).mockReturnValue(undefined);

      taskController.update(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 400 for invalid ID', () => {
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { title: 'Updated' };

      taskController.update(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid task ID' });
    });

    it('should return 400 for empty title', () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: '' };

      taskController.update(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Title must be a non-empty string' });
    });

    it('should return 400 for invalid status', () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'bad_status' };

      taskController.update(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid status. Must be one of: pending, in_progress, completed',
      });
    });

    it('should return 500 on error', () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Updated' };
      (TaskModel.update as Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      taskController.update(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to update task' });
    });
  });

  describe('delete', () => {
    it('should delete a task', () => {
      mockRequest.params = { id: '1' };
      (TaskModel.delete as Mock).mockReturnValue(true);

      taskController.delete(mockRequest as Request, mockResponse as Response);

      expect(TaskModel.delete).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(sendMock).toHaveBeenCalled();
    });

    it('should return 404 when task not found', () => {
      mockRequest.params = { id: '999' };
      (TaskModel.delete as Mock).mockReturnValue(false);

      taskController.delete(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Task not found' });
    });

    it('should return 400 for invalid ID', () => {
      mockRequest.params = { id: 'invalid' };

      taskController.delete(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid task ID' });
    });

    it('should return 500 on error', () => {
      mockRequest.params = { id: '1' };
      (TaskModel.delete as Mock).mockImplementation(() => {
        throw new Error('Database error');
      });

      taskController.delete(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to delete task' });
    });
  });
});

