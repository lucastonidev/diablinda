/**
 * @fileoverview Servidor HTTP de Alta Performance com Server-Sent Events (SSE).
 * 100% nativo em Node.js (sem dependências externas), pronto para integração com o RimuBusca.
 */

import http from 'node:http';
import { URL } from 'node:url';
import { DiablindaEngine } from '../core/engine.js';
import { getAllModules, getCategoriesCount } from '../modules/index.js';
import { isValidEmail } from '../core/validator.js';
import { c } from '../cli/theme.js';

/**
 * Adiciona headers padrão de CORS para qualquer requisição HTTP.
 * @param {http.ServerResponse} res
 */
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Responde com payload JSON.
 * @param {http.ServerResponse} res
 * @param {number} status
 * @param {any} data
 */
function sendJson(res, status, data) {
  setCorsHeaders(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Inicia o servidor HTTP da Diablinda.
 * @param {Object} [options={}]
 * @param {number} [options.port=3000]
 * @param {string} [options.host='0.0.0.0']
 * @returns {Promise<http.Server>}
 */
export function startServer(options = {}) {
  const port = options.port || 3000;
  const host = options.host || '0.0.0.0';

  const server = http.createServer(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = reqUrl.pathname;

    // Rota GET / -> Documentação da API
    if (pathname === '/' && req.method === 'GET') {
      return sendJson(res, 200, {
        name: 'Diablinda OSINT API',
        version: '1.0.0',
        runtime: 'Node.js ESM (Native)',
        endpoints: {
          'GET /': 'Documentação e status da API',
          'GET /modules': 'Lista todos os módulos OSINT e categorias disponíveis',
          'GET /scan?email=...&category=...': 'Streaming em tempo real via Server-Sent Events (SSE)',
          'POST /scan': 'Varredura síncrona retornando JSON completo (body: { email, category })'
        }
      });
    }

    // Rota GET /modules -> Listar módulos
    if (pathname === '/modules' && req.method === 'GET') {
      const modules = getAllModules().map((m) => ({
        id: m.id,
        name: m.name,
        category: m.category,
        url: m.url,
        description: m.description,
        iconSvg: m.iconSvg,
        color: m.color
      }));
      return sendJson(res, 200, {
        total: modules.length,
        categories: getCategoriesCount(),
        modules
      });
    }

    // Rota GET /scan -> Streaming com SSE (Server-Sent Events)
    if (pathname === '/scan' && req.method === 'GET') {
      const email = reqUrl.searchParams.get('email');
      const category = reqUrl.searchParams.get('category');
      const concurrency = parseInt(reqUrl.searchParams.get('concurrency'), 10) || 15;
      const timeout = parseInt(reqUrl.searchParams.get('timeout'), 10) || 8000;

      if (!email || !isValidEmail(email)) {
        return sendJson(res, 400, { error: 'Endereço de e-mail inválido ou ausente no parâmetro "?email="' });
      }

      // Configura conexão SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      const sendEvent = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      const controller = new AbortController();
      req.on('close', () => {
        controller.abort();
      });

      const engine = new DiablindaEngine({ concurrency, timeout });

      engine.on('start', (data) => sendEvent('start', data));
      engine.on('hit', (hit) => sendEvent('hit', hit));
      engine.on('miss', (miss) => sendEvent('miss', miss));
      engine.on('progress', (prog) => sendEvent('progress', prog));
      engine.on('service_error', (err) => sendEvent('service_error', err));

      try {
        const summary = await engine.scan(email, {
          category,
          signal: controller.signal
        });
        sendEvent('done', summary);
      } catch (err) {
        sendEvent('error', { message: err.message });
      } finally {
        res.end();
      }
      return;
    }

    // Rota POST /scan -> JSON batch
    if (pathname === '/scan' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 1e6) req.destroy();
      });

      req.on('end', async () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const email = parsed.email;

          if (!email || !isValidEmail(email)) {
            return sendJson(res, 400, { error: 'Endereço de e-mail inválido ou ausente no body.' });
          }

          const engine = new DiablindaEngine({
            concurrency: parsed.concurrency || 15,
            timeout: parsed.timeout || 8000
          });

          const summary = await engine.scan(email, {
            category: parsed.category,
            modules: parsed.modules
          });

          return sendJson(res, 200, summary);
        } catch (err) {
          return sendJson(res, 500, { error: err.message });
        }
      });
      return;
    }

    // 404 para rotas não mapeadas
    return sendJson(res, 404, { error: 'Rota não encontrada.' });
  });

  return new Promise((resolve) => {
    server.listen(port, host, () => {
      console.log(`\n${c.brightGreen}${c.bold}🚀 Servidor Diablinda SSE ativo em:${c.reset} ${c.brightCyan}http://${host}:${port}${c.reset}`);
      console.log(`${c.dim}• Documentação: http://${host}:${port}/${c.reset}`);
      console.log(`${c.dim}• Módulos:     http://${host}:${port}/modules${c.reset}`);
      console.log(`${c.dim}• Exemplo SSE: http://${host}:${port}/scan?email=alvo@email.com${c.reset}\n`);
      resolve(server);
    });
  });
}

