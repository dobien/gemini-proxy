const express = require('express');
const fetch = require('node-fetch');
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

  // Формирование полного URL для запроса
  const proxiedUrl = externalUrl + req.url;

  try {
    // Проксирование запроса
    const proxiedRequest = new fetch.Request(proxiedUrl, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : null, // Преобразуем тело запроса в JSON-строку
    });

    // Выполнение запроса к внешнему API
    const response = await fetch(proxiedRequest);

    // Установка заголовков ответа
    response.headers.forEach( (value, name) => {
      res.setHeader(name, value);
    });

    // Отправка ответа клиенту
    res.status(response.status);
    const text = await response.text();
    res.send(text);

  } catch (error) {
    // Обработка ошибок
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
