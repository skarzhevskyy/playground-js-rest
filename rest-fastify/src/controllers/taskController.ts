import { Repository, DataSource } from 'typeorm';
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskResponse, toTaskResponse } from '../entities/Task.js';

export class TaskController {
  private taskRepository: Repository<Task>;

  constructor(dataSource: DataSource) {
    this.taskRepository = dataSource.getRepository(Task);
  }

  async getAllTasks(): Promise<TaskResponse[]> {
    const tasks = await this.taskRepository.find({
      order: { createdAt: 'DESC' },
    });
    return tasks.map(toTaskResponse);
  }

  async getTaskById(id: number): Promise<TaskResponse | null> {
    const task = await this.taskRepository.findOneBy({ id });
    return task ? toTaskResponse(task) : null;
  }

  async createTask(data: CreateTaskDTO): Promise<TaskResponse> {
    const task = this.taskRepository.create({
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? 'pending',
    });
    const savedTask = await this.taskRepository.save(task);
    return toTaskResponse(savedTask);
  }

  async updateTask(id: number, data: UpdateTaskDTO): Promise<TaskResponse | null> {
    const task = await this.taskRepository.findOneBy({ id });
    
    if (!task) {
      return null;
    }

    if (data.title !== undefined) {
      task.title = data.title;
    }
    if (data.description !== undefined) {
      task.description = data.description;
    }
    if (data.status !== undefined) {
      task.status = data.status;
    }

    const updatedTask = await this.taskRepository.save(task);
    return toTaskResponse(updatedTask);
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await this.taskRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}

