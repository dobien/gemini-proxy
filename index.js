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

  // Формирование полного URL для запроса
  const proxiedUrl = externalUrl + req.url;

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: req.url,
    method: req.method,
    headers: req.headers,
    rejectUnauthorized: false // Отключаем проверку сертификата
  };

  const reqToExternal = https.request(options, (externalRes) => {
    res.status(externalRes.statusCode);
    if (externalRes.headers) {
      for (const name in externalRes.headers) {
        res.setHeader(name, externalRes.headers[name]);
      }
    }
    externalRes.pipe(res);
  });

  reqToExternal.on('error', (e) => {
    console.error(e);
    res.status(500).json({ error: e.message });
  });

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    reqToExternal.write(JSON.stringify(req.body));
  }
  reqToExternal.end();
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
