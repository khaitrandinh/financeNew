/*
// const crypto = require('crypto');
// const axios = require('axios');


// const apiKey = '0jKHgQLJFo8N6SbJ04yrOAtSji6VEZz6T5XxUrfbc0X4sUdXRHOPnKMfzpuOvXeE';
// const apiSecret = '17tg79VNaBuirrRfIGIUI7CXWxnJsS3ClieCqzG2DBDTMrz7dmLm61IRsDP3VG8Q';

// const apiUrl = 'https://nami.exchange/api/v1/chart/history';
// timestamp = Date.now().toString();
// console.log('timestamp:', timestamp);

// data = {}

// params = {
//   type: '0',
//   timestamp: timestamp,
// };


// const queryString = `type=${params.type}&timestamp=${params.timestamp}`;
// console.log('queryString:', queryString);

// const signature = crypto.createHmac('sha256', apiSecret)
//   .update(queryString)
//   .digest('hex');

// console.log('signature:', signature);

// const url = `https://nami.exchange/api/v1/chart/history`;
// axios.get(url, {
//   headers: {
//     'x-api-key': apiKey
//   }
// }).then(res => {
//   console.log('Response:', res.data);
// }).catch(err => {
//   console.error('Error:', err.response?.data || err.message);
// });
*/

const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const allowedOrigins = ["http://localhost:3000"];
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true,
}));

const apiKey = process.env.apiKeyNews;

console.log('apiKey:', apiKey);
app.get('/api/news', async (req, res) => {
  try {
    const response = await fetch(`https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&filter=hot&currencies=BTC`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching news data:', error);
    res.status(500).json({ error: 'Failed to fetch news data' });
  }
});

