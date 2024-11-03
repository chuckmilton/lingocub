// api/dubbed-audio.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { dubbingId, languageCode, apiKey } = req.query;

    const url = `https://api.elevenlabs.io/v1/dubbing/${dubbingId}/audio/${languageCode}`;

    try {
        const response = await fetch(url, {
            headers: { 'xi-api-key': apiKey },
        });

        if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            res.setHeader('Content-Type', 'audio/mpeg');
            res.send(buffer);
        } else {
            const errorText = await response.text();
            res.status(response.status).send(errorText || 'Error fetching dubbed audio');
        }
    } catch (error) {
        console.error('Error fetching dubbed audio:', error);
        res.status(500).send('Error fetching dubbed audio');
    }
}
