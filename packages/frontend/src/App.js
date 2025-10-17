import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      if (!response.ok) {
        throw new Error('Failed to add item');
      }
      const result = await response.json();
      setData([...data, result]);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      setError('Error adding item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      setData(data.filter(item => item.id !== itemId));
      setError(null);
    } catch (err) {
      setError('Error deleting item: ' + err.message);
      console.error('Error deleting item:', err);
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/items/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTitle, description: editDescription }),
      });
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      const updatedItem = await response.json();
      setData(data.map(item => item.id === editId ? updatedItem : item));
      setEditId(null);
      setEditTitle('');
      setEditDescription('');
    } catch (err) {
      setError('Error updating item: ' + err.message);
      console.error('Error updating item:', err);
    }
  };

  const handleCompleteToggle = async (item) => {
    try {
      const response = await fetch(`/api/items/${item.id}/completed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !item.completed }),
      });
      if (!response.ok) {
        throw new Error('Failed to update completion status');
      }
      const updatedItem = await response.json();
      setData(data.map(i => i.id === item.id ? updatedItem : i));
    } catch (err) {
      setError('Error updating completion status: ' + err.message);
      console.error('Error updating completion status:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>To Do App</h1>
        <p>Keep track of your tasks</p>
      </header>

      <main>
        <section className="add-item-section">
          <h2>Add New Task</h2>
          <form onSubmit={handleSubmit} className="material-form">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Task title"
              aria-label="Task title"
              required
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Task description"
              aria-label="Task description"
            />
            <button type="submit" className="material-btn">Add Task</button>
          </form>
        </section>

        <section className="items-section">
          <h2>Tasks</h2>
          {loading && <p>Loading data...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && (
            <ul className="task-list">
              {data.length > 0 ? (
                data.map((item) => (
                  <li key={item.id} className={`task-item${item.completed ? ' completed' : ''}`}>
                    <div className="task-main">
                      <input
                        type="checkbox"
                        checked={!!item.completed}
                        onChange={() => handleCompleteToggle(item)}
                        aria-label={item.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      />
                      <span className="task-title">{item.title}</span>
                      <span className="task-desc">{item.description}</span>
                    </div>
                    <div className="task-actions">
                      <button
                        onClick={() => handleEdit(item)}
                        className="material-btn edit-btn"
                        type="button"
                        aria-label="Edit task"
                      >Edit</button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="material-btn delete-btn"
                        type="button"
                        aria-label="Delete task"
                      >Delete</button>
                    </div>
                    {editId === item.id && (
                      <form onSubmit={handleEditSubmit} className="edit-form">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Edit title"
                          aria-label="Edit title"
                          required
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Edit description"
                          aria-label="Edit description"
                        />
                        <button type="submit" className="material-btn save-btn">Save</button>
                        <button type="button" className="material-btn cancel-btn" onClick={() => setEditId(null)}>Cancel</button>
                      </form>
                    )}
                  </li>
                ))
              ) : (
                <p>No tasks found. Add some!</p>
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;