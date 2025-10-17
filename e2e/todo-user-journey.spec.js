import { test, expect } from '@playwright/test';

// E2E: Full user journey for TODO app

test.describe('TODO App User Journey', () => {
  test('should allow user to add, edit, complete, and delete tasks', async ({ page }) => {
    // Go to the app
    await page.goto('/');

    // Add a new task
  await page.getByPlaceholder('Task title').fill('E2E Task');
  await page.getByPlaceholder('Task description').fill('E2E Description');
  await page.getByRole('button', { name: 'Add Task' }).click();
  // Find the task item by its title
  const taskItem = page.locator('.task-item', { has: page.getByText('E2E Task') });
  await expect(taskItem.getByText('E2E Task')).toBeVisible();
  await expect(taskItem.getByText('E2E Description')).toBeVisible();

  // Edit the task
  await taskItem.getByRole('button', { name: 'Edit task' }).click();
  await page.getByPlaceholder('Edit title').fill('E2E Task Edited');
  await page.getByPlaceholder('Edit description').fill('E2E Description Edited');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(taskItem.getByText('E2E Task Edited')).toBeVisible();
  await expect(taskItem.getByText('E2E Description Edited')).toBeVisible();

  // Mark as completed
  await taskItem.getByRole('checkbox').check();
  await expect(taskItem.getByText('E2E Task Edited')).toHaveClass(/completed/);

  // Delete the task
  await taskItem.getByRole('button', { name: 'Delete task' }).click();
  await expect(taskItem.getByText('E2E Task Edited')).not.toBeVisible();
  });
});
