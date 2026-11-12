import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto.js';
import { TaskResponseDto } from './dto/task-response.dto.js';
import { TaskSort } from './task-sort.enum.js';
import { TaskStatus } from './task-status.enum.js';
import { TasksService } from './tasks.service.js';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks with optional status and due-date sort' })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  @ApiQuery({ name: 'sort', required: false, enum: TaskSort })
  @ApiOkResponse({ description: 'Tasks matching the query.', type: [TaskResponseDto] })
  @ApiBadRequestResponse({ description: 'Invalid status or sort value.' })
  findAll(@Query() query: ListTasksQueryDto) {
    return this.tasksService.findAll(query);
  }
}
