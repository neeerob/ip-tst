const express = require('express');
const geoip = require('geoip-lite');

const app = express();
app.set('trust proxy', 1);

app.get('/api/test/live/ip', (req, res) => {
  try {
    const rawIp = req.ip || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || 'Unknown';
    const clientIp = rawIp.startsWith('::ffff:') ? rawIp.slice(7) : rawIp;

    const geo = geoip.lookup(clientIp);

    return res.status(200).json({
      error: false,
      message: "IP test endpoint",
      data: {
        ip: clientIp,
        rawIp: rawIp,
        xForwardedFor: req.headers['x-forwarded-for'] || null,
        xRealIp: req.headers['x-real-ip'] || null,
        reqIp: req.ip || null,
        geo: geo ? {
          country: geo.country || null,
          region: geo.region || null,
          city: geo.city || null,
          timezone: geo.timezone || null,
          ll: geo.ll || null,
        } : { note: 'Local/private IP — geo not available. Only work on VPS.' }
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: true,
      message: "Failed to retrieve IP",
      data: null
    });
  }
});

const port = Number(process.env.PORT) || 7004;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
