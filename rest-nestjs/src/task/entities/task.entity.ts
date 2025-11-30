import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../dto/create-task.dto';

export class TaskEntity {
  @ApiProperty({
    description: 'The unique identifier of the task',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The title of the task',
    example: 'Complete project documentation',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the task',
    example: 'Write comprehensive documentation for the REST API endpoints',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'The current status of the task',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'The date and time when the task was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the task was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<TaskEntity>) {
    Object.assign(this, partial);
  }
}

