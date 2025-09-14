const { Client } = require('pg');
const http = require('http');
const path = require('path');
const fs = require('fs');

// --- Настройка Postgres ---
const pgClient = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: 5432,
    user: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'secret',
    database: process.env.POSTGRES_DB || 'testdb',
});

pgClient.connect()
    .then(() => console.log('Connected to Postgres'))
    .catch(err => console.error('Connection error', err));

// --- Создание таблицы и тестовые запросы ---
pgClient.query('CREATE TABLE IF NOT EXISTS test_table(id SERIAL PRIMARY KEY, name TEXT)')
    .then(() => console.log('Table created'))
    .catch(err => console.error(err));

pgClient.query("INSERT INTO test_table(name) VALUES('Alice')")
    .then(() => console.log('Inserted Alice'))
    .catch(err => console.error(err));

pgClient.query('SELECT * FROM test_table')
    .then(res => console.log('Rows:', res.rows))
    .catch(err => console.error(err));

// --- Логи ---
const logsPath = path.resolve('./logs');
if (!fs.existsSync(logsPath)) fs.mkdirSync(logsPath, { recursive: true });

const port = process.env.PORT;
if (!port) throw new Error('PORT variable not set!');

const instanceId = process.env.INSTANCE_ID || '0';
const logFilePath = path.join(logsPath, `access-log-${instanceId}.log`);

const createdAt = new Date();
const favoriteColor = process.env.FAVORITE_COLOR || 'unknown';
const luckyNumberRange = process.env.LUCKY_NUMBER_RANGE || '1-100';
const appName = process.env.APP_NAME || 'MyApp';

// Функция генерации случайного числа
function getLuckyNumber(range) {
    const [min, max] = range.split('-').map(Number);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- HTTP сервер ---
const server = http.createServer((req, res) => {
    // Записываем запрос в лог
    try {
        fs.appendFileSync(logFilePath, `${new Date().toISOString()}: request\n`);
    } catch (err) {
        console.error('Failed to write log:', err);
    }

    // Возвращаем ответ
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(
        `=== ${appName} ===\n` +
        `Server started at: ${createdAt.toISOString()}\n` +
        `PORT=${port}\n` +
        `INSTANCE_ID=${instanceId}\n` +
        `Favorite color: ${favoriteColor}\n` +
        `Your lucky number today: ${getLuckyNumber(luckyNumberRange)}\n`
    );
});

server.listen(port, () => console.log(`Server running at http://localhost:${port}/`));
