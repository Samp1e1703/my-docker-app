const http = require('http');
const fs = require('fs');
const path = require('path');

// Пути к подключенным volumes
const logsService1 = '/logs_service1';
const logsService2 = '/logs_service2';

// Функция чтения последних N строк из файла
function tail(filePath, lines = 10) {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf8').split('\n');
    return data.filter(Boolean).slice(-lines);
}

const server = http.createServer((req, res) => {
    const logs1 = fs.readdirSync(logsService1)
        .flatMap(file => tail(path.join(logsService1, file)));

    const logs2 = fs.readdirSync(logsService2)
        .flatMap(file => tail(path.join(logsService2, file)));

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(
        '=== Logs from Service 1 ===\n' + logs1.join('\n') +
        '\n\n=== Logs from Service 2 ===\n' + logs2.join('\n')
    );
});

const port = process.env.PORT || 4000;
server.listen(port, () => {
    console.log(`Aggregator running at http://localhost:${port}/`);
});
