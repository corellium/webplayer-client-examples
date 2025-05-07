const express = require('express');
const fetch = require('node-fetch');
const app = express();
const https = require('https');
const cors = require('cors');
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const helmet = require('helmet')
app.use(helmet())

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
  })
);

app.use(express.static('public'));

app.post('/api/auth', jsonParser, async (req, res) => {
  const loginUrl = 'https://ci-1.corellium.co/api/v1/webplayer'; // this domain would be https://app.corellium.co/api/v1/webplayer in production

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  try {
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: req.body.token, // your API token
      },
      body: JSON.stringify({
        projectId: req.body.projectId,
        instanceId: req.body.instanceId,
        expiresIn: 60 * 60 * 5, // value is in seconds
        features: req.body.features,
      }),
      agent: httpsAgent,
    });

    const data = await response.json();

    res.send(data);

    return;
  } catch (err) {
    console.log('webplayer ERROR: ', err);
    throw new Error(err);
  }
});

app.listen(8000);
console.log('Server running on port %d', 8000);
