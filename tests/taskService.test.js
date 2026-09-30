const taskService = require('../src/services/taskService');

describe('taskService.create', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('creates a task with default values', () => {
    const task = taskService.create({
      title: 'Write tests',
    });

    expect(task).toHaveProperty('id');
    expect(task.title).toBe('Write tests');
    expect(task.description).toBe('');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.dueDate).toBeNull();
    expect(task.completedAt).toBeNull();
    expect(task).toHaveProperty('createdAt');
  });
});

describe('taskService.findById', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('finds a task by its id', () => {
    const createdTask = taskService.create({
      title: 'Find this task',
    });

    const foundTask = taskService.findById(createdTask.id);

    expect(foundTask).toEqual(createdTask);
  });

  test('returns undefined when task does not exist', () => {
    const foundTask = taskService.findById('non-existent-id');

    expect(foundTask).toBeUndefined();
  });
});

describe('taskService.getAll', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('returns all tasks', () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });

    const tasks = taskService.getAll();

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task 1');
    expect(tasks[1].title).toBe('Task 2');
  });
});

describe('taskService.getByStatus', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('returns tasks with the requested status', () => {
    taskService.create({
      title: 'Todo task',
      status: 'todo',
    });

    taskService.create({
      title: 'Done task',
      status: 'done',
    });

    const tasks = taskService.getByStatus('todo');

    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Todo task');
  });

  test('does not return tasks for a partial status', () => {
    taskService.create({
      title: 'In progress task',
      status: 'in_progress',
    });

    const tasks = taskService.getByStatus('in');

    expect(tasks).toHaveLength(0);
  });
});

describe('taskService.getPaginated', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('returns the first page of tasks', () => {
    taskService.create({ title: 'Task 1' });
    taskService.create({ title: 'Task 2' });
    taskService.create({ title: 'Task 3' });

    const tasks = taskService.getPaginated(1, 2);

    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe('Task 1');
    expect(tasks[1].title).toBe('Task 2');
  });
});

describe('taskService.completeTask', () => {
  beforeEach(() => {
    taskService._reset();
  });

  test('marks a task as done and preserves its priority', () => {
    const task = taskService.create({
      title: 'Important task',
      priority: 'high',
    });

    const completedTask = taskService.completeTask(task.id);

    expect(completedTask.status).toBe('done');
    expect(completedTask.priority).toBe('high');
    expect(completedTask.completedAt).not.toBeNull();
  });

  test('returns null when task does not exist', () => {
    const completedTask = taskService.completeTask('non-existent-id');

    expect(completedTask).toBeNull();
  });
});