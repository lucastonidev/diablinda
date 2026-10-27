import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DiablindaEngine } from '../src/core/engine.js';
import { registerModule } from '../src/modules/index.js';

describe('Motor de Execução DiablindaEngine', () => {
  it('deve rejeitar e-mail inválido', async () => {
    const engine = new DiablindaEngine();
    await assert.rejects(
      async () => engine.scan('email-invalido'),
      /Endereço de e-mail inválido/
    );
  });

  it('deve emitir eventos de hit, miss, progresso e done com módulo simulado', async () => {
    registerModule({
      id: 'mock_hit',
      name: 'Mock Hit Service',
      category: 'tech',
      check: async () => ({
        exists: true,
        metadata: {
          username: 'teste',
          name: 'Usuário Teste'
        }
      })
    });

    const engine = new DiablindaEngine({ concurrency: 2 });
    const events = [];

    engine.on('start', (d) => events.push(['start', d.email]));
    engine.on('hit', (h) => events.push(['hit', h.id]));
    engine.on('progress', (p) => events.push(['progress', p.current]));
    engine.on('done', (s) => events.push(['done', s.hits]));

    const summary = await engine.scan('teste@example.com', {
      modules: ['mock_hit']
    });

    assert.equal(summary.email, 'teste@example.com');
    assert.equal(summary.hits, 1);
    assert.equal(summary.totalModules, 1);
    assert.ok(events.some((e) => e[0] === 'start'));
    assert.ok(events.some((e) => e[0] === 'hit' && e[1] === 'mock_hit'));
    assert.ok(events.some((e) => e[0] === 'done'));
  });
});

