import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/items handler
  rest.get('/api/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, title: 'Test Task 1', description: 'Desc 1', completed: 0, created_at: '2023-01-01T00:00:00.000Z' },
        { id: 2, title: 'Test Task 2', description: 'Desc 2', completed: 1, created_at: '2023-01-02T00:00:00.000Z' },
      ])
    );
  }),

  // POST /api/items handler
  rest.post('/api/items', (req, res, ctx) => {
    const { title, description } = req.body;
    if (!title || title.trim() === '') {
      return res(
        ctx.status(400),
        ctx.json({ error: 'Item title is required' })
      );
    }
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        title,
        description,
        completed: 0,
        created_at: new Date().toISOString(),
      })
    );
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {


  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('To Do App')).toBeInTheDocument();
    expect(screen.getByText('Keep track of your tasks')).toBeInTheDocument();
  });

  test('loads and displays tasks', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
      expect(screen.getByText('Desc 1')).toBeInTheDocument();
      expect(screen.getByText('Desc 2')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.queryByText('Loading data...')).not.toBeInTheDocument();
    });
    const titleInput = screen.getByPlaceholderText('Task title');
    const descInput = screen.getByPlaceholderText('Task description');
    await act(async () => {
      await user.type(titleInput, 'New Test Task');
      await user.type(descInput, 'New Description');
    });
    const submitButton = screen.getByText('Add Task');
    await act(async () => {
      await user.click(submitButton);
    });
    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
      expect(screen.getByText('New Description')).toBeInTheDocument();
    });
  });
  test('handles API error', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch data/)).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks', async () => {
    server.use(
      rest.get('/api/items', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );
    await act(async () => {
      render(<App />);
    });
    await waitFor(() => {
      expect(screen.getByText('No tasks found. Add some!')).toBeInTheDocument();
    });
  });
});