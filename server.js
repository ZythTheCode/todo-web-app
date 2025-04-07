const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'todo_db'
});

// Fetch all tasks
app.get('/tasks', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('SELECT * FROM tasks', (err, rows) => {
            connection.release();
            if (!err) res.json(rows);
            else console.log(err);
        });
    });
});

// Add a new task
app.post('/tasks', (req, res) => {
    const { task } = req.body;
    if (!task.trim()) return res.status(400).json({ error: 'Task cannot be empty' });

    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('INSERT INTO tasks (task) VALUES (?)', [task], (err, result) => {
            connection.release();
            if (!err) res.json({ id: result.insertId, task });
            else console.log(err);
        });
    });
});

// Edit an existing task
app.put('/tasks/:id', (req, res) => {
    const { task } = req.body;
    const taskId = req.params.id;

    if (!task.trim()) return res.status(400).json({ error: 'Task cannot be empty' });

    pool.getConnection((err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database connection failed' });
        }

        connection.query('UPDATE tasks SET task = ? WHERE id = ?', [task, taskId], (err, result) => {
            connection.release();

            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to update task' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            res.json({ message: 'Task updated successfully' });
        });
    });
});



// Delete a task
app.delete('/tasks/:id', (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
            connection.release();
            if (!err) res.json({ message: `Task with ID: ${req.params.id} has been removed.` });
            else console.log(err);
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
