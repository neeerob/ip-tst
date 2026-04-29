const express = require('express');
const geoip = require('geoip-lite');

const app = express();
app.set('trust proxy', 1);

app.get('/api/test/live/ip', (req, res) => {
  try {
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.ip || req.socket?.remoteAddress || 'Unknown';
    const clientIp = rawIp.startsWith('::ffff:') ? rawIp.slice(7) : rawIp;

    const geo = geoip.lookup(clientIp);

    return res.status(200).json({
      error: false,
      message: "IP test endpoint V2",
      data: {
        ip: clientIp,
        rawIp: rawIp,
        xForwardedFor: req.headers['x-forwarded-for'] || null,
        xRealIp: req.headers['x-real-ip'] || null,
        reqIp: req.ip || null,
        ipHeadersDetails: {
          "x-forwarded-for": req.headers['x-forwarded-for'] || null,
          "cf-connecting-ip": req.headers['cf-connecting-ip'] || null,
          "x-real-ip": req.headers['x-real-ip'] || null,
          "ip": req.ip || null,
          "remoteAddress": req.socket?.remoteAddress || null,
        },
        extraIpHeaders: {
          "x-forwarded-for": req.headers['x-forwarded-for'] || null,
          "cf-connecting-ip": req.headers['cf-connecting-ip'] || null,
          "x-real-ip": req.headers['x-real-ip'] || null,
          "x-client-ip": req.headers['x-client-ip'] || null,
          "x-forwarded": req.headers['x-forwarded'] || null,
          "forwarded": req.headers['forwarded'] || null,
          "via": req.headers['via'] || null,
          "true-client-ip": req.headers['true-client-ip'] || null
        },
        isPrivateIp: /^(127\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|::1)/.test(clientIp),
        proxyDebug: {
          reqIp: req.ip,
          reqIps: req.ips,
          remoteAddress: req.socket?.remoteAddress,
          protocol: req.protocol,
          secure: req.secure
        },
        agentDetails: {
          "user-agent": req.headers['user-agent'] || null,
          "accept": req.headers['accept'] || null,
          "accept-language": req.headers['accept-language'] || null,
          "accept-encoding": req.headers['accept-encoding'] || null,
          "connection": req.headers['connection'] || null,
          "host": req.headers['host'] || null,
        },
        refererDetails: {
          "referer": req.headers['referer'] || null,
          "origin": req.headers['origin'] || null,
        },
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
})

const port = Number(process.env.PORT) || 7004;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
