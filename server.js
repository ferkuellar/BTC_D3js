const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const port = 3000;

// Tu clave API y secreto
require('dotenv').config();

// Ahora puedes acceder a las variables de entorno a través de process.env
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;
;

// Permitir solicitudes CORS desde el cliente
app.use(cors());

// Endpoint para obtener los datos de Binance
app.get('/btc-price', async (req, res) => {
    const url = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=100';
    const response = await fetch(url, {
        headers: {
        'X-MBX-APIKEY': apiKey
        }
    });
    const data = await response.json();
    res.json(data);
    });

    app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
