import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateTaskDto } from './create-task.dto.js';

describe('CreateTaskDto validation', () => {
  const validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  const validate = (value: object) =>
    validationPipe.transform(value, {
      type: 'body',
      metatype: CreateTaskDto,
    });

  it('accepts a valid task and transforms it to its DTO class', async () => {
    const result = await validate({
      title: 'Prepare release',
      status: 'IN_PROGRESS',
      dueDate: '2026-11-30T12:00:00.000Z',
    });

    expect(result).toBeInstanceOf(CreateTaskDto);
    expect(result).toMatchObject({
      title: 'Prepare release',
      status: 'IN_PROGRESS',
    });
  });

  it('rejects a missing title', async () => {
    await expect(validate({ description: 'No title' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects unsupported status values', async () => {
    await expect(validate({ title: 'Task', status: 'BLOCKED' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rejects properties not declared in the DTO', async () => {
    await expect(
      validate({ title: 'Task', unexpected: true }),
    ).rejects.toThrow(BadRequestException);
  });
});
