import { Request, Response } from 'express';
import { TaskModel, CreateTaskDTO, UpdateTaskDTO, TaskStatus } from '../models/Task.js';

const VALID_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed'];

function isValidStatus(status: unknown): status is TaskStatus {
  return typeof status === 'string' && VALID_STATUSES.includes(status as TaskStatus);
}

export const taskController = {
  /**
   * Get all tasks
   */
  getAll(_req: Request, res: Response): void {
    try {
      const tasks = TaskModel.findAll();
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  },

  /**
   * Get task by ID
   */
  getById(req: Request, res: Response): void {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid task ID' });
        return;
      }

      const task = TaskModel.findById(id);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  },

  /**
   * Create a new task
   */
  create(req: Request, res: Response): void {
    try {
      const { title, description, status } = req.body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        res.status(400).json({ error: 'Title is required and must be a non-empty string' });
        return;
      }

      if (status !== undefined && !isValidStatus(status)) {
        res.status(400).json({ 
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
        });
        return;
      }

      const taskData: CreateTaskDTO = {
        title: title.trim(),
        description: description?.trim() || undefined,
        status: status as TaskStatus | undefined,
      };

      const task = TaskModel.create(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  },

  /**
   * Update an existing task
   */
  update(req: Request, res: Response): void {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid task ID' });
        return;
      }

      const { title, description, status } = req.body;

      if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
        res.status(400).json({ error: 'Title must be a non-empty string' });
        return;
      }

      if (status !== undefined && !isValidStatus(status)) {
        res.status(400).json({ 
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
        });
        return;
      }

      const updateData: UpdateTaskDTO = {};
      
      if (title !== undefined) {
        updateData.title = title.trim();
      }
      if (description !== undefined) {
        updateData.description = description?.trim() || null;
      }
      if (status !== undefined) {
        updateData.status = status as TaskStatus;
      }

      const task = TaskModel.update(id, updateData);
      
      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  },

  /**
   * Delete a task
   */
  delete(req: Request, res: Response): void {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid task ID' });
        return;
      }

      const deleted = TaskModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  },
};

