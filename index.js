const express = require('express');
const https = require('https');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware для обработки CORS (необходимо для запросов из браузера)
app.use(cors());

// Middleware для обработки JSON-тела запроса
app.use(express.json());

app.all('*', async (req, res) => {
  // URL внешнего сервера Gemini API
  const externalUrl = "https://generativelanguage.googleapis.com";

  // Используем оригинальный URL без изменения (Express обычно уже декодирует URL)
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: req.originalUrl, // передаём URL как есть
    method: req.method,
    headers: req.headers,
    rejectUnauthorized: false // Отключаем проверку сертификата
  };

  const externalReq = https.request(options, (externalRes) => {
    res.status(externalRes.statusCode);
    for (const name in externalRes.headers) {
      res.setHeader(name, externalRes.headers[name]);
    }
    externalRes.pipe(res);
  });

  externalReq.on('error', (err) => {
    console.error('Ошибка запроса: ', err);
    res.status(500).json({ error: err.message });
  });

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    externalReq.write(JSON.stringify(req.body));
  }
  externalReq.end();
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
