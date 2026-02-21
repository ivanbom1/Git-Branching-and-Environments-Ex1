require('./config');
const express = require('express');
const { Client } = require('pg');

const app = express();
app.use(express.json());

const client = new Client({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE
});

client.connect().then(() => {
  console.log('DB connected!');
  return client.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN DEFAULT false
    )
  `);
}).catch(err => {
  console.error('DB connect failed', err.message);
  process.exit(1);
});

// CREATE
app.post('/todos', async (req, res) => {
  const { title } = req.body;
  const result = await client.query(
    'INSERT INTO todos (title) VALUES ($1) RETURNING *', [title]
  );
  res.json(result.rows[0]);
});

// READ ALL
app.get('/todos', async (req, res) => {
  const result = await client.query('SELECT * FROM todos');
  res.json(result.rows);
});

// UPDATE
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;
  const result = await client.query(
    'UPDATE todos SET done=$1 WHERE id=$2 RETURNING *', [done, id]
  );
  res.json(result.rows[0]);
});

// DELETE
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  await client.query('DELETE FROM todos WHERE id=$1', [id]);
  res.json({ message: 'Deleted' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});