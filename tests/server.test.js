import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from '../src/server/index.js';

describe('Servidor HTTP e Streaming SSE', () => {
  it('deve responder à rota GET / com documentação e status', async () => {
    const server = await startServer({ port: 3099 });
    try {
      const res = await fetch('http://localhost:3099/');
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.name, 'Diablinda OSINT API');
      assert.ok(data.endpoints);
    } finally {
      server.close();
    }
  });

  it('deve responder à rota GET /modules com a lista de módulos', async () => {
    const server = await startServer({ port: 3098 });
    try {
      const res = await fetch('http://localhost:3098/modules');
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.total >= 10);
      assert.ok(Array.isArray(data.modules));
      assert.ok(data.categories);
    } finally {
      server.close();
    }
  });

  it('deve rejeitar e-mail inválido em GET /scan com 400', async () => {
    const server = await startServer({ port: 3097 });
    try {
      const res = await fetch('http://localhost:3097/scan?email=invalido');
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.ok(data.error);
    } finally {
      server.close();
    }
  });
});

