const express = require('express');
const https = require('https');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.all('*', async (req, res) => {
  const externalUrl = "https://generativelanguage.googleapis.com";
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: req.originalUrl,
    method: req.method,
    headers: { ...req.headers }, // Копируем заголовки
    rejectUnauthorized: false
  };

  // Переопределяем Host для целевого сервера
  options.headers.host = options.hostname;

  // Удаляем лишние заголовки, которые могут мешать
  delete options.headers.origin;
  delete options.headers.referer;

  console.log(`Forwarding to: ${externalUrl}${req.originalUrl}`, options.headers);

  /*const externalReq = https.request(options, (externalRes) => {
    console.log(`Received response with status code ${externalRes.statusCode}`);
    res.status(externalRes.statusCode);
    for (const name in externalRes.headers) {
      res.setHeader(name, externalRes.headers[name]);
    }
    externalRes.pipe(res);
  });*/

  const externalReq = https.request(options, (externalRes) => {
    console.log(`Received response with status code ${externalRes.statusCode}`);
    res.status(externalRes.statusCode);
    externalRes.pipe(res);
  });

  externalReq.on('error', (err) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  });

  // Отправляем тело запроса, если необходимо
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    externalReq.write(JSON.stringify(req.body));
  }
  externalReq.end();
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
