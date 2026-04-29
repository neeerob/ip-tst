const express = require('express');
const geoip = require('geoip-lite');

const app = express();
app.set('trust proxy', true);

function stripIpv4Mapped(value) {
  if (value == null) return value;
  const s = String(value);
  return s.replace(/^::ffff:/i, '');
}

function firstForwarded(forwarded) {
  if (forwarded == null) return undefined;
  const first = String(forwarded).split(',')[0];
  return first.trim() || undefined;
}

function detectClientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  const xff = firstForwarded(req.headers['x-forwarded-for']);
  const xri = req.headers['x-real-ip'];
  const raw =
    (typeof cf === 'string' && cf.trim()) ||
    xff ||
    (typeof xri === 'string' && xri.trim()) ||
    req.socket.remoteAddress ||
    req.ip;
  return stripIpv4Mapped(raw);
}

app.get('/api/test/live/ip', (req, res) => {
  const detected = detectClientIp(req);
  const geo = detected ? geoip.lookup(detected) : null;

  res.json({
    detectedClientIp: detected,
    reqIp: req.ip,
    reqIps: req.ips,
    socketRemoteAddress: req.socket.remoteAddress,
    xForwardedFor: req.headers['x-forwarded-for'] ?? null,
    xRealIp: req.headers['x-real-ip'] ?? null,
    allHeaders: req.headers,
    geo,
  });
});

const port = Number(process.env.PORT) || 7004;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
