const express = require('express');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();
const https = require('https');
const cors = require('cors');
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const helmet = require('helmet');
app.use(helmet());

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    exposedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.static('public'));

app.post('/api/auth', jsonParser, async (req, res) => {
  console.log('Received auth request at:', new Date().toISOString());
  console.log('Request headers:', req.headers);

  // Change this URL to your domain URL
  const baseUrl = ''; // example - https://app.corellium.co in production

  const loginUrl = `${baseUrl}/api/v1/webplayer`;

  console.log('Incoming request data:', {
    projectId: req.body?.projectId,
    instanceId: req.body?.instanceId,
    features: req.body?.features,
    hasToken: !!req.body?.token,
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: req.body.token,
      Accept: 'application/json',
    },
    body: JSON.stringify({
      projectId: req.body.projectId,
      instanceId: req.body.instanceId,
      expiresIn: 60 * 60 * 5,
      features: req.body.features,
    }),
    agent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };

  try {
    console.log('Making request to:', loginUrl);
    console.log('Request options:', {
      method: options.method,
      headers: options.headers,
      body: JSON.parse(options.body),
    });

    const response = await fetch(loginUrl, options);

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const data = await response.json();
    console.log('Success response:', data);

    // Set explicit headers for the response
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Accept'
    );

    console.log('Sending response to client');
    res.send(data);
    console.log('Response sent successfully');
  } catch (err) {
    console.error('Webplayer Error:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      error: 'Failed to connect to webplayer service',
      details: err.message,
      status: err.status || 500,
    });
  }
});

app.listen(8000);
console.log('Server running on port %d', 8000);
