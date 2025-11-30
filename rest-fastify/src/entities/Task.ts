import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: TaskStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

// DTOs for request/response
export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

// Convert Task entity to response format
export const toTaskResponse = (task: Task): TaskResponse => ({
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  createdAt: task.createdAt.toISOString(),
  updatedAt: task.updatedAt.toISOString(),
});

