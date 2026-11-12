import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { ListTasksQueryDto } from './dto/list-tasks-query.dto.js';

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
