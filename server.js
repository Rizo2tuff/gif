// Live Discord Banner Generator (Express + Canvas + GIFEncoder)

const express = require('express');
const multer = require('multer');
const { createCanvas, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

registerFont(path.join(__dirname, 'fonts', 'Montserrat-Bold.ttf'), { family: 'Montserrat' });

app.post('/generate', async (req, res) => {
  const chunks = [];
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString();
    const username = decodeURIComponent(body.split('=')[1] || 'Username');

    const width = 1280;
    const height = 480;
    const frames = 30;
    const encoder = new GIFEncoder(width, height);
    const filePath = path.join(__dirname, 'public', `banner_${username}.gif`);
    const out = fs.createWriteStream(filePath);

    encoder.createReadStream().pipe(out);
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(100);
    encoder.setQuality(10);

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < frames; i++) {
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, width, height);

      const pulse = Math.floor(10 + 20 * Math.sin((i / frames) * 2 * Math.PI));
      ctx.font = '80px Montserrat';
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = pulse;
      ctx.fillText(username, 80, height / 2 + 20);

      encoder.addFrame(ctx);
      ctx.clearRect(0, 0, width, height);
    }

    encoder.finish();
    out.on('finish', () => {
      res.redirect(`/banner_${username}.gif`);
    });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
