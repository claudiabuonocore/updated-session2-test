const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize file-based SQLite database for persistence
const db = new Database('todo.sqlite');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialItems = [
  { title: 'Item 1', description: 'Description 1', completed: 0 },
  { title: 'Item 2', description: 'Description 2', completed: 0 },
  { title: 'Item 3', description: 'Description 3', completed: 0 },
];
const insertStmt = db.prepare('INSERT INTO items (title, description, completed) VALUES (?, ?, ?)');

const itemCount = db.prepare('SELECT COUNT(*) as count FROM items').get().count;
if (itemCount === 0) {
  initialItems.forEach(item => {
    insertStmt.run(item.title, item.description, item.completed);
  });
  console.log('Database seeded with initial sample data');
} else {
  console.log('Database already contains items, skipping seeding');
}

// API Routes

// Get all items
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Create a new item
app.post('/api/items', (req, res) => {
  try {
    const { title, description, completed } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Item title is required' });
    }

    const result = insertStmt.run(title, description || '', completed ? 1 : 0);
    const id = result.lastInsertRowid;
    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update an item
app.put('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updateStmt = db.prepare(`
      UPDATE items SET
        title = ?,
        description = ?,
        completed = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    updateStmt.run(
      title || existingItem.title,
      description !== undefined ? description : existingItem.description,
      completed !== undefined ? (completed ? 1 : 0) : existingItem.completed,
      id
    );

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Mark item as completed/uncompleted
app.patch('/api/items/:id/completed', (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updateStmt = db.prepare('UPDATE items SET completed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    updateStmt.run(completed ? 1 : 0, id);

    const updatedItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating completion status:', error);
    res.status(500).json({ error: 'Failed to update completion status' });
  }
});


// Delete an item
app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const existingItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes > 0) {
      res.json({ message: 'Item deleted successfully', id: parseInt(id) });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db, insertStmt };