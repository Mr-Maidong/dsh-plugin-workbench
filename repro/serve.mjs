/**
 * Throwaway static server for looking at `repro/card-preview.html` in a browser.
 *
 * Chrome's extension cannot open `file:` URLs, so the preview has to be served
 * over http. Binds to loopback on a fixed port and serves the repository root.
 *
 * Usage: node repro/serve.mjs [port]
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve('.')
const port = Number(process.argv[2] ?? 47811)

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}

createServer(async (request, response) => {
  const path = normalize(decodeURIComponent((request.url ?? '/').split('?')[0]))
  const file = join(root, path === '/' ? '/repro/card-preview.html' : path)
  if (!file.startsWith(root)) {
    response.writeHead(403).end('no')
    return
  }
  try {
    const body = await readFile(file)
    response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
    response.end(body)
  } catch {
    response.writeHead(404).end('not found')
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`preview: http://127.0.0.1:${port}/repro/card-preview.html`)
})
