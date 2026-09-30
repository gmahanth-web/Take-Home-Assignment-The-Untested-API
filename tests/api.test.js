const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('POST /tasks', () => {
    test('creates a new task', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          title: 'Write API tests',
          priority: 'high',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Write API tests');
      expect(response.body.priority).toBe('high');
      expect(response.body.status).toBe('todo');
    });

    test('rejects a task without a title', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          priority: 'high',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /tasks', () => {
    test('returns all tasks', async () => {
      await request(app)
        .post('/tasks')
        .send({ title: 'Task 1' });

      await request(app)
        .post('/tasks')
        .send({ title: 'Task 2' });

      const response = await request(app)
        .get('/tasks');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Task 1');
      expect(response.body[1].title).toBe('Task 2');
    });

    test('returns an empty array when there are no tasks', async () => {
      const response = await request(app)
        .get('/tasks');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
    });

    test('filters tasks by status', async () => {
      await request(app)
        .post('/tasks')
        .send({
          title: 'Todo task',
          status: 'todo',
        });

      await request(app)
        .post('/tasks')
        .send({
          title: 'Done task',
          status: 'done',
        });

      const response = await request(app)
        .get('/tasks?status=todo');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Todo task');
    });

    test('paginates tasks', async () => {
      await request(app)
        .post('/tasks')
        .send({ title: 'Task 1' });

      await request(app)
        .post('/tasks')
        .send({ title: 'Task 2' });

      await request(app)
        .post('/tasks')
        .send({ title: 'Task 3' });

      const response = await request(app)
        .get('/tasks?page=1&limit=2');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Task 1');
      expect(response.body[1].title).toBe('Task 2');
    });
  });

  describe('GET /tasks/stats', () => {
    test('returns task counts by status', async () => {
      await request(app)
        .post('/tasks')
        .send({
          title: 'Todo task',
          status: 'todo',
        });

      await request(app)
        .post('/tasks')
        .send({
          title: 'In progress task',
          status: 'in_progress',
        });

      await request(app)
        .post('/tasks')
        .send({
          title: 'Done task',
          status: 'done',
        });

      const response = await request(app)
        .get('/tasks/stats');

      expect(response.statusCode).toBe(200);
      expect(response.body.todo).toBe(1);
      expect(response.body.in_progress).toBe(1);
      expect(response.body.done).toBe(1);
      expect(response.body.overdue).toBe(0);
    });

    test('returns zero counts when there are no tasks', async () => {
      const response = await request(app)
        .get('/tasks/stats');

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        todo: 0,
        in_progress: 0,
        done: 0,
        overdue: 0,
      });
    });
  });

  describe('PUT /tasks/:id', () => {
    test('updates an existing task', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Original title',
          priority: 'low',
        });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .put(`/tasks/${taskId}`)
        .send({
          title: 'Updated title',
          priority: 'high',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Updated title');
      expect(response.body.priority).toBe('high');
    });

    test('returns 404 when task does not exist', async () => {
      const response = await request(app)
        .put('/tasks/non-existent-id')
        .send({
          title: 'Updated title',
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('deletes an existing task', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Task to delete',
        });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .delete(`/tasks/${taskId}`);

      expect(response.statusCode).toBe(204);

      const getResponse = await request(app)
        .get('/tasks');

      expect(getResponse.body).toHaveLength(0);
    });

    test('returns 404 when task does not exist', async () => {
      const response = await request(app)
        .delete('/tasks/non-existent-id');

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    test('marks an existing task as completed', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Complete this task',
          priority: 'high',
        });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .patch(`/tasks/${taskId}/complete`);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(taskId);
      expect(response.body.status).toBe('done');
      expect(response.body.priority).toBe('high');
      expect(response.body.completedAt).not.toBeNull();
    });

    test('returns 404 when task does not exist', async () => {
      const response = await request(app)
        .patch('/tasks/non-existent-id/complete');

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('PATCH /tasks/:id/assign', () => {
    test('assigns a task to a user', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Task to assign',
        });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .patch(`/tasks/${taskId}/assign`)
        .send({
          assignee: 'John',
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(taskId);
      expect(response.body.assignee).toBe('John');
    });

    test('returns 404 when task does not exist', async () => {
      const response = await request(app)
        .patch('/tasks/non-existent-id/assign')
        .send({
          assignee: 'John',
        });

      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('Task not found');
    });

    test('rejects an empty assignee', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({
          title: 'Task to assign',
        });

      const taskId = createResponse.body.id;

      const response = await request(app)
        .patch(`/tasks/${taskId}/assign`)
        .send({
          assignee: '',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});