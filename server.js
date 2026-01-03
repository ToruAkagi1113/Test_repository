const http = require('http');
const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const port = Number(process.env.PORT || process.argv[2] || 8000);

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  const normalizedPath = path.normalize(urlPath).replace(/^\.\.(\\|\/)*/g, '');
  const trimmedPath = normalizedPath.replace(/^[/\\]+/, '');
  const relativePath = trimmedPath === '' ? 'index.html' : trimmedPath;
  const filePath = path.join(baseDir, relativePath);
  const resolvedPath = path.resolve(filePath);

  if (!resolvedPath.startsWith(baseDir + path.sep) && resolvedPath !== baseDir) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  fs.stat(resolvedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(resolvedPath).pipe(res);
  });
});

server.listen(port, () => {
  console.log(`九九練習アプリを http://localhost:${port} で提供中`);
});
