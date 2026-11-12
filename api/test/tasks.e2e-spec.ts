import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { AppModule } from '../src/app.module.js';
import { TaskStatus } from '../src/tasks/task-status.enum.js';

describe('TasksController (e2e)', () => {
  let app: INestApplication<App>;
  const taskWithoutDueDate = {
    id: '8ae09f6e-e554-4651-9552-39192e5a9451',
    title: 'No due date',
    description: null,
    status: TaskStatus.TODO,
    dueDate: null,
    createdAt: '2026-11-02T10:00:00.000Z',
    updatedAt: '2026-11-02T10:00:00.000Z',
  };
  const taskWithDueDate = {
    ...taskWithoutDueDate,
    id: 'd77fc0da-c7b3-4f4a-b9f3-5456d13851c3',
    title: 'Due date set',
    dueDate: '2026-11-20T10:00:00.000Z',
  };
  const taskWithEarlierDueDate = {
    ...taskWithoutDueDate,
    id: '5c34b868-5466-4f50-b66e-13856a2cf9a0',
    title: 'Earlier due date',
    dueDate: '2026-11-10T10:00:00.000Z',
  };
  const taskCreate = vi.fn().mockResolvedValue({
    id: '2b982cec-1f12-4be2-9644-1eeddb2e91ac',
    title: 'New task',
    description: 'Created from the API',
    status: TaskStatus.IN_PROGRESS,
    dueDate: '2026-12-01T10:00:00.000Z',
    createdAt: '2026-11-12T10:00:00.000Z',
    updatedAt: '2026-11-12T10:00:00.000Z',
  });
  const taskFindUnique = vi.fn();
  const findMany = vi.fn().mockImplementation(async (args) => {
    if (args.where.dueDate?.not === null) {
      return args.orderBy[0].dueDate === 'asc'
        ? [taskWithEarlierDueDate, taskWithDueDate]
        : [taskWithDueDate, taskWithEarlierDueDate];
    }

    if (args.where.dueDate === null) {
      return [taskWithoutDueDate];
    }

    if (args.where.status === TaskStatus.DONE) {
      return [{ ...taskWithoutDueDate, status: TaskStatus.DONE }];
    }

    return [taskWithoutDueDate, taskWithDueDate];
  });

  beforeEach(async () => {
    findMany.mockClear();
    taskCreate.mockClear();
    taskFindUnique.mockReset();
    taskFindUnique.mockResolvedValue(taskWithDueDate);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        task: { create: taskCreate, findMany, findUnique: taskFindUnique },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('creates a task and converts its due date to a Date for Prisma', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'New task',
        description: 'Created from the API',
        status: TaskStatus.IN_PROGRESS,
        dueDate: '2026-12-01T10:00:00.000Z',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      title: 'New task',
      status: TaskStatus.IN_PROGRESS,
      dueDate: '2026-12-01T10:00:00.000Z',
    });
    expect(taskCreate).toHaveBeenCalledWith({
      data: {
        title: 'New task',
        description: 'Created from the API',
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2026-12-01T10:00:00.000Z'),
      },
    });
  });

  it('rejects invalid task input without creating a task', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: '', unexpected: true })
      .expect(400);

    expect(taskCreate).not.toHaveBeenCalled();
  });

  it('returns a task by its UUID', async () => {
    const response = await request(app.getHttpServer())
      .get(`/tasks/${taskWithDueDate.id}`)
      .expect(200);

    expect(response.body).toEqual(taskWithDueDate);
    expect(taskFindUnique).toHaveBeenCalledWith({
      where: { id: taskWithDueDate.id },
    });
  });

  it('returns 404 when the task does not exist', async () => {
    taskFindUnique.mockResolvedValueOnce(null);

    await request(app.getHttpServer())
      .get('/tasks/8ae09f6e-e554-4651-9552-39192e5a9451')
      .expect(404);
  });

  it('returns 400 when the task ID is not a UUID', async () => {
    await request(app.getHttpServer()).get('/tasks/not-a-uuid').expect(400);

    expect(taskFindUnique).not.toHaveBeenCalled();
  });

  it('lists tasks in creation order by default', async () => {
    await request(app.getHttpServer())
      .get('/tasks')
      .expect(200)
      .expect([taskWithoutDueDate, taskWithDueDate]);

    expect(findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  });

  it('filters tasks by status', async () => {
    const response = await request(app.getHttpServer())
      .get('/tasks?status=DONE')
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe(TaskStatus.DONE);
    expect(findMany).toHaveBeenCalledWith({
      where: { status: TaskStatus.DONE },
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    });
  });

  it('sorts dated tasks and returns tasks without due dates last', async () => {
    const response = await request(app.getHttpServer())
      .get('/tasks?sort=asc')
      .expect(200);

    expect(response.body.map((task: { id: string }) => task.id)).toEqual([
      taskWithEarlierDueDate.id,
      taskWithDueDate.id,
      taskWithoutDueDate.id,
    ]);
    expect(findMany).toHaveBeenCalledTimes(2);
  });

  it('sorts by due date descending while keeping undated tasks last', async () => {
    const response = await request(app.getHttpServer())
      .get('/tasks?sort=desc')
      .expect(200);

    expect(response.body.map((task: { id: string }) => task.id)).toEqual([
      taskWithDueDate.id,
      taskWithEarlierDueDate.id,
      taskWithoutDueDate.id,
    ]);
  });

  it.each([
    ['status', 'INVALID'],
    ['sort', 'sideways'],
  ])('rejects invalid %s query values', async (parameter, value) => {
    await request(app.getHttpServer())
      .get(`/tasks?${parameter}=${value}`)
      .expect(400);

    expect(findMany).not.toHaveBeenCalled();
  });

  afterEach(async () => {
    await app.close();
  });
});
