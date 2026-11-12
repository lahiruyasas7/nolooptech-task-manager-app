import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto) {
    const { dueDate, ...taskData } = createTaskDto;

    return this.prisma.task.create({
      data: {
        ...taskData,
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found.`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const { dueDate, ...taskData } = updateTaskDto;

    try {
      return await this.prisma.task.update({
        where: { id },
        data: {
          ...taskData,
          ...(dueDate !== undefined
            ? { dueDate: dueDate === null ? null : new Date(dueDate) }
            : {}),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Task with ID "${id}" not found.`);
      }

      throw error;
    }
  }

  async findAll({ status, sort }: ListTasksQueryDto) {
    const where: Prisma.TaskWhereInput = status ? { status } : {};

    if (!sort) {
      return this.prisma.task.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      });
    }

    const [tasksWithDueDate, tasksWithoutDueDate] = await Promise.all([
      this.prisma.task.findMany({
        where: { ...where, dueDate: { not: null } },
        orderBy: [{ dueDate: sort }, { createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.prisma.task.findMany({
        where: { ...where, dueDate: null },
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
    ]);

    return [...tasksWithDueDate, ...tasksWithoutDueDate];
  }
}
