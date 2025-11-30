import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: 'The task has been successfully created.',
    type: TaskEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  async create(@Body() createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({
    status: 200,
    description: 'Returns all tasks.',
    type: [TaskEntity],
  })
  async findAll(): Promise<TaskEntity[]> {
    return this.taskService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns the task.',
    type: TaskEntity,
  })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TaskEntity> {
    const task = await this.taskService.findOne(id);
    if (!task) {
      throw new NotFoundException({ error: 'Task not found' });
    }
    return task;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID', type: Number })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'The task has been successfully updated.',
    type: TaskEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<TaskEntity> {
    const task = await this.taskService.update(id, updateTaskDto);
    if (!task) {
      throw new NotFoundException({ error: 'Task not found' });
    }
    return task;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID', type: Number })
  @ApiResponse({ status: 204, description: 'The task has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const deleted = await this.taskService.remove(id);
    if (!deleted) {
      throw new NotFoundException({ error: 'Task not found' });
    }
  }
}

