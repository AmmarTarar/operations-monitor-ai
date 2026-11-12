import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8000);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function getPathname(requestUrl) {
  try {
    const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
    return pathname === '/' ? '/app/' : pathname;
  } catch {
    return null;
  }
}

function resolveWithinProject(pathname) {
  const target = resolve(projectRoot, `.${pathname}`);
  return target === projectRoot || target.startsWith(`${projectRoot}${sep}`) ? target : null;
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method not allowed');
    return;
  }
  const pathname = getPathname(request.url);
  const requestedPath = pathname && resolveWithinProject(pathname);
  if (!requestedPath) {
    response.writeHead(400);
    response.end('Invalid path');
    return;
  }

  let filePath = requestedPath;
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = resolve(filePath, 'index.html');
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) throw new Error('Not a file');
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Operations Monitor is available at http://127.0.0.1:${port}/app/`);
});
