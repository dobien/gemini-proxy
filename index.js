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
    headers: req.headers,
    rejectUnauthorized: false
  };

  console.log(`Forwarding request to ${externalUrl}${req.originalUrl}`);

  const externalReq = https.request(options, (externalRes) => {
    console.log(`Received response with status code ${externalRes.statusCode}`);
    res.status(externalRes.statusCode);
    for (const name in externalRes.headers) {
      res.setHeader(name, externalRes.headers[name]);
    }
    externalRes.pipe(res);
  });

  externalReq.on('error', (err) => {
    console.error('Request error: ', err);
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
