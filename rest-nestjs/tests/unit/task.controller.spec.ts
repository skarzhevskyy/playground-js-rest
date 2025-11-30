import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TaskController } from '../../src/task/task.controller';
import { TaskService } from '../../src/task/task.service';
import { TaskEntity } from '../../src/task/entities/task.entity';
import { TaskStatus } from '../../src/task/dto/create-task.dto';

describe('TaskController', () => {
  let controller: TaskController;
  let mockTaskService: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  const mockTask: TaskEntity = {
    id: 1,
    title: 'Test Task',
    description: null,
    status: TaskStatus.PENDING,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  beforeEach(async () => {
    mockTaskService = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  describe('create', () => {
    it('should create a task with only title', async () => {
      const createDto = { title: 'Test Task' };
      mockTaskService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockTask);
      expect(mockTaskService.create).toHaveBeenCalledWith(createDto);
    });

    it('should create a task with all fields', async () => {
      const createDto = {
        title: 'Complete Task',
        description: 'This is a description',
        status: TaskStatus.IN_PROGRESS,
      };
      const taskWithAllFields = {
        ...mockTask,
        title: 'Complete Task',
        description: 'This is a description',
        status: TaskStatus.IN_PROGRESS,
      };
      mockTaskService.create.mockResolvedValue(taskWithAllFields);

      const result = await controller.create(createDto);

      expect(result).toEqual(taskWithAllFields);
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no tasks exist', async () => {
      mockTaskService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should return all tasks', async () => {
      const tasks = [
        mockTask,
        { ...mockTask, id: 2, title: 'Second Task' },
        { ...mockTask, id: 3, title: 'Third Task' },
      ];
      mockTaskService.findAll.mockResolvedValue(tasks);

      const result = await controller.findAll();

      expect(result).toHaveLength(3);
      expect(mockTaskService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a task when it exists', async () => {
      mockTaskService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockTask);
      expect(mockTaskService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(9999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update task title', async () => {
      const updateDto = { title: 'Updated Title' };
      const updatedTask = { ...mockTask, title: 'Updated Title' };
      mockTaskService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(1, updateDto);

      expect(result.title).toBe('Updated Title');
      expect(mockTaskService.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should update task description', async () => {
      const updateDto = { description: 'New description' };
      const updatedTask = { ...mockTask, description: 'New description' };
      mockTaskService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(1, updateDto);

      expect(result.description).toBe('New description');
    });

    it('should update task status', async () => {
      const updateDto = { status: TaskStatus.COMPLETED };
      const updatedTask = { ...mockTask, status: TaskStatus.COMPLETED };
      mockTaskService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(1, updateDto);

      expect(result.status).toBe(TaskStatus.COMPLETED);
    });

    it('should update multiple fields at once', async () => {
      const updateDto = {
        title: 'New Title',
        description: 'New Description',
        status: TaskStatus.IN_PROGRESS,
      };
      const updatedTask = {
        ...mockTask,
        title: 'New Title',
        description: 'New Description',
        status: TaskStatus.IN_PROGRESS,
      };
      mockTaskService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(1, updateDto);

      expect(result).toMatchObject({
        title: 'New Title',
        description: 'New Description',
        status: TaskStatus.IN_PROGRESS,
      });
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskService.update.mockResolvedValue(null);

      await expect(
        controller.update(9999, { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an existing task', async () => {
      mockTaskService.remove.mockResolvedValue(true);

      await expect(controller.remove(1)).resolves.not.toThrow();
      expect(mockTaskService.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when task does not exist', async () => {
      mockTaskService.remove.mockResolvedValue(false);

      await expect(controller.remove(9999)).rejects.toThrow(NotFoundException);
    });
  });
});
