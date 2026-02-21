require('./config');
const express = require('express');
const { Client } = require('pg');
const app = express();
const client = new Client({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE
});
client.connect().then(() => {
  console.log('DB connected!');
}).catch(err => {
  console.error('DB connect failed', err.message);
  process.exit(1);
});

client.query(`
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    done BOOLEAN DEFAULT false
  )
`).catch(() => {});