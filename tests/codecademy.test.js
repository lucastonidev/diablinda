import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import codecademy from '../src/modules/tech/codecademy.js';

describe('Módulo Codecademy - Verificação Anti-Soft-404', () => {
  it('não deve marcar soft-404 ("Profile Not Found") como encontrado', async () => {
    // Intercepta fetch global temporariamente para testar a resposta exata do print
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return {
        status: 200,
        text: async () => `
          <!doctype html>
          <html>
            <head>
              <title>Profile Not Found | Codecademy</title>
              <link rel="canonical" href="https://www.codecademy.com/profiles/cmazini" />
            </head>
            <body>
              <div>
                <h1>This profile could not be found</h1>
              </div>
            </body>
          </html>
        `
      };
    };

    try {
      const result = await codecademy.check('cmazini@gmail.com');
      assert.equal(result.exists, false, 'Deve retornar exists: false para a tela de Profile Not Found');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve marcar perfil real com dados válidos como encontrado', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return {
        status: 200,
        text: async () => `
          <!doctype html>
          <html>
            <head>
              <title>cmazini | Codecademy</title>
            </head>
            <body>
              <div data-testid="profile-header">
                <h1>Carlos Mazini</h1>
              </div>
            </body>
          </html>
        `
      };
    };

    try {
      const result = await codecademy.check('cmazini@gmail.com');
      assert.equal(result.exists, true);
      assert.equal(result.metadata.username, 'cmazini');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

