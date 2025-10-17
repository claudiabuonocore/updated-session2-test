const request = require('supertest');
const { app, db } = require('../src/app');

// Close the database connection after all tests
afterAll(() => {
  if (db) {
    db.close();
  }
});

// Test helpers
const createItem = async (title = 'Temp Item', description = 'Temp Description', completed = false) => {
  const response = await request(app)
    .post('/api/items')
    .send({ title, description, completed })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check if items have the expected structure
      const item = response.body[0];
  expect(item).toHaveProperty('id');
  expect(item).toHaveProperty('title');
  expect(item).toHaveProperty('description');
  expect(item).toHaveProperty('completed');
  expect(item).toHaveProperty('created_at');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = { title: 'Test Item', description: 'Test Desc', completed: false };
      const response = await request(app)
        .post('/api/items')
        .send(newItem)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newItem.title);
      expect(response.body.description).toBe(newItem.description);
      expect(response.body.completed).toBe(0);
      expect(response.body).toHaveProperty('created_at');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item title is required');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ title: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Item title is required');
    });
  });

  describe('PUT /api/items/:id', () => {
    it('should update an existing item', async () => {
      const item = await createItem('Editable Item', 'Edit Desc');
      const updatedTitle = 'Updated Title';
      const updatedDescription = 'Updated Description';
      const response = await request(app)
        .put(`/api/items/${item.id}`)
        .send({ title: updatedTitle, description: updatedDescription })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedTitle);
      expect(response.body.description).toBe(updatedDescription);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .put('/api/items/999999')
        .send({ title: 'Does not exist' })
        .set('Accept', 'application/json');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });
  });

  describe('PATCH /api/items/:id/completed', () => {
    it('should mark item as completed and uncompleted', async () => {
      const item = await createItem('Complete Me', 'Complete Desc', false);
      const completeResponse = await request(app)
        .patch(`/api/items/${item.id}/completed`)
        .send({ completed: true })
        .set('Accept', 'application/json');
      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.completed).toBe(1);

      const uncompleteResponse = await request(app)
        .patch(`/api/items/${item.id}/completed`)
        .send({ completed: false })
        .set('Accept', 'application/json');
      expect(uncompleteResponse.status).toBe(200);
      expect(uncompleteResponse.body.completed).toBe(0);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app)
        .patch('/api/items/999999/completed')
        .send({ completed: true })
        .set('Accept', 'application/json');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await createItem('Item To Be Deleted', 'Delete Desc');
      const deleteResponse = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ message: 'Item deleted successfully', id: item.id });

      const deleteAgain = await request(app).delete(`/api/items/${item.id}`);
      expect(deleteAgain.status).toBe(404);
      expect(deleteAgain.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 404 when item does not exist', async () => {
      const response = await request(app).delete('/api/items/999999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });

    it('should return 400 for invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Valid item ID is required');
    });
  });
});