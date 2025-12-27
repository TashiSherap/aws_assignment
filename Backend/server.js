const express = require('express');
const mysql = require('mysql2/promise'); // Use promise version for async/await
const cors = require('cors');            // Important: fixes CORS issues
const app = express();

app.use(cors());              // Allow frontend to access backend
app.use(express.json());

// === UPDATE THESE WITH YOUR ACTUAL MYSQL CREDENTIALS ===
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'uncrackpass123',  // ← your new password here
    database: 'expenses_db'
};

// Simple API key middleware (for demo only)
app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'demo-key') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});

// GET all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM expenses ORDER BY date DESC');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET single expense (for edit)
app.get('/api/expenses/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
        await connection.end();
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// POST - Add new expense
app.post('/api/expenses', async (req, res) => {
    const { name, amount, category, date } = req.body;
    if (!name || !amount || !category || !date) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO expenses (name, amount, category, date) VALUES (?, ?, ?, ?)',
            [name, amount, category, date]
        );
        await connection.end();
        res.status(201).json({ message: 'Expense added' });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ error: 'Failed to add expense' });
    }
});

// PUT - Update expense
app.put('/api/expenses/:id', async (req, res) => {
    const { name, amount, category, date } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE expenses SET name = ?, amount = ?, category = ?, date = ? WHERE id = ?',
            [name, amount, category, date, req.params.id]
        );
        await connection.end();
        res.json({ message: 'Expense updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update' });
    }
});

// DELETE expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM expenses WHERE id = ?', [req.params.id]);
        await connection.end();
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log('API endpoints:');
    console.log('  GET    /api/expenses');
    console.log('  POST   /api/expenses');
    console.log('  PUT    /api/expenses/:id');
    console.log('  DELETE /api/expenses/:id');
});