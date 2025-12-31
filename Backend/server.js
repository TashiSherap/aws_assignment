const express = require('express');
const mysql = require('mysql2/promise');
const { Pool } = require('pg'); // Added for Render PostgreSQL support
const cors = require('cors');           
const app = express();

// 1. DYNAMIC CORS: Allow all origins and your specific headers
app.use(cors({
    origin: '*', 
    allowedHeaders: ['Content-Type', 'x-api-key']
}));

app.use(express.json());

// 2. DATABASE CONFIGURATION
const isProduction = process.env.DATABASE_URL ? true : false;
let pgPool;

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'uncrackpass123', 
    database: 'expenses_db'
};

// 3. HYBRID QUERY HELPER
// This replaces the need to manually open/close connections in every route
async function runQuery(sql, params = []) {
    if (isProduction) {
        // --- RENDER (PostgreSQL) ---
        if (!pgPool) {
            pgPool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }
            });
        }
        // PostgreSQL uses $1, $2 instead of ?
        const pgSql = sql.replace(/\?/g, (match, index) => `$${params.indexOf(params[index]) + 1}`);
        const res = await pgPool.query(pgSql, params);
        return [res.rows];
    } else {
        // --- LOCAL (MySQL) ---
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(sql, params);
        await connection.end();
        return [rows];
    }
}

// 4. API KEY MIDDLEWARE
app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'demo-key') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});

// 5. ROUTES (Updated to use runQuery)

// GET all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const [rows] = await runQuery('SELECT * FROM expenses ORDER BY date DESC');
        res.json(rows);
    } catch (error) {
        console.error('DATABASE ERROR:', error.message);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET single expense
app.get('/api/expenses/:id', async (req, res) => {
    try {
        const [rows] = await runQuery('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
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
        await runQuery(
            'INSERT INTO expenses (name, amount, category, date) VALUES (?, ?, ?, ?)',
            [name, amount, category, date]
        );
        res.status(201).json({ message: 'Expense added' });
    } catch (error) {
        console.error('Error adding expense:', error.message);
        res.status(500).json({ error: 'Failed to add expense' });
    }
});

// PUT - Update expense
app.put('/api/expenses/:id', async (req, res) => {
    const { name, amount, category, date } = req.body;
    try {
        await runQuery(
            'UPDATE expenses SET name = ?, amount = ?, category = ?, date = ? WHERE id = ?',
            [name, amount, category, date, req.params.id]
        );
        res.json({ message: 'Expense updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update' });
    }
});

// DELETE expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        await runQuery('DELETE FROM expenses WHERE id = ?', [req.params.id]);
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

// 6. DYNAMIC PORT STARTUP
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend running in ${isProduction ? 'PRODUCTION' : 'LOCAL'} mode`);
    console.log(`Server listening on port ${PORT}`);
});