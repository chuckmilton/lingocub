// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());

app.get('/dubbed-audio', async (req, res) => {
  const { dubbingId, languageCode, apiKey } = req.query;

  const url = `https://api.elevenlabs.io/v1/dubbing/${dubbingId}/audio/${languageCode}`;

  try {
    const response = await fetch(url, {
      headers: { 'xi-api-key': apiKey },
    });

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'audio/mpeg'); // Audio content type
      res.send(buffer);
    } else {
      const errorText = await response.text();
      res.status(response.status).send(errorText || 'Error fetching dubbed audio');
    }
  } catch (error) {
    console.error('Error fetching dubbed audio:', error);
    res.status(500).send('Error fetching dubbed audio');
  }
});

app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});
