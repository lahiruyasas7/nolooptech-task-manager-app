import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto.js';
import { TaskResponseDto } from './dto/task-response.dto.js';
import { TaskSort } from './task-sort.enum.js';
import { TaskStatus } from './task-status.enum.js';
import { TasksService } from './tasks.service.js';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiCreatedResponse({ description: 'Task created.', type: TaskResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid task input.' })
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task UUID', format: 'uuid' })
  @ApiOkResponse({ description: 'Task found.', type: TaskResponseDto })
  @ApiBadRequestResponse({ description: 'Task ID is not a valid UUID.' })
  @ApiNotFoundResponse({ description: 'Task was not found.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tasksService.findOne(id);
  }

  @Get()
  @ApiOperation({
    summary: 'List tasks with optional status and due-date sort',
  })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  @ApiQuery({ name: 'sort', required: false, enum: TaskSort })
  @ApiOkResponse({
    description: 'Tasks matching the query.',
    type: [TaskResponseDto],
  })
  @ApiBadRequestResponse({ description: 'Invalid status or sort value.' })
  findAll(@Query() query: ListTasksQueryDto) {
    return this.tasksService.findAll(query);
  }
}
