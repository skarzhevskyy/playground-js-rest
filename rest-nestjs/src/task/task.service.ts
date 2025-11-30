import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    const task = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description ?? null,
        status: createTaskDto.status ?? 'pending',
      },
    });
    return this.mapToEntity(task);
  }

  async findAll(): Promise<TaskEntity[]> {
    const tasks = await this.prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map((task) => this.mapToEntity(task));
  }

  async findOne(id: number): Promise<TaskEntity | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    return task ? this.mapToEntity(task) : null;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<TaskEntity | null> {
    const existing = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return null;
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        status: updateTaskDto.status,
      },
    });
    return this.mapToEntity(task);
  }

  async remove(id: number): Promise<boolean> {
    const existing = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return false;
    }

    await this.prisma.task.delete({
      where: { id },
    });
    return true;
  }

  private mapToEntity(task: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): TaskEntity {
    return new TaskEntity({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  }
}

