import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TaskSort } from '../task-sort.enum.js';
import { TaskStatus } from '../task-status.enum.js';

export class ListTasksQueryDto {
  @ApiPropertyOptional({
    description: 'Filter tasks by status.',
    enum: TaskStatus,
    enumName: 'TaskStatus',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description:
      'Sort by due date. Tasks without a due date are always returned last.',
    enum: TaskSort,
    enumName: 'TaskSort',
  })
  @IsOptional()
  @IsEnum(TaskSort)
  sort?: TaskSort;
}
