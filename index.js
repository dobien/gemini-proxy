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
  
  // Используем оригинальный URL (с query-параметрами), и заменяем двоеточия на URL-кодированное представление
  // Это необходимо, если в URL присутствует двоеточие (например, gemini-2.0-flash-exp:generateContent)
  let encodedPath = req.originalUrl.replace(/:/g, '%3A');

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    // Подставляем закодированный путь
    path: encodedPath,
    method: req.method,
    headers: req.headers,
    rejectUnauthorized: false // Если нужно отключить проверку сертификата
  };

  const externalReq = https.request(options, (externalRes) => {
    // Устанавливаем статус ответа по статусу внешнего ответа
    res.status(externalRes.statusCode);
    // Передаем заголовки внешнего ответа клиенту
    for (const name in externalRes.headers) {
      res.setHeader(name, externalRes.headers[name]);
    }
    // Передаем поток данных наружу
    externalRes.pipe(res);
  });

  externalReq.on('error', (err) => {
    console.error('Ошибка запроса: ', err);
    res.status(500).json({ error: err.message });
  });

  // Для методов, отличных от GET/HEAD, отправляем тело запроса
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    externalReq.write(JSON.stringify(req.body));
  }
  externalReq.end();
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
