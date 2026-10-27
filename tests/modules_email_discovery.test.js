import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import google from '../src/modules/tech/google.js';
import apple from '../src/modules/tech/apple.js';
import patreon from '../src/modules/finance/patreon.js';
import devrant from '../src/modules/tech/devrant.js';
import aboutme from '../src/modules/social/aboutme.js';

describe('Verificação Direta por E-mail em Módulos Específicos', () => {
  it('Google deve detectar automaticamente e-mails @gmail.com', async () => {
    const res = await google.check('testuser123@gmail.com');
    assert.equal(res.exists, true);
    assert.equal(res.metadata?.extra?.hasGoogleAccount, true);
    assert.equal(res.metadata?.extra?.verifiedByEmail, true);
  });

  it('Apple deve identificar domínios nativos da Apple (@icloud.com)', async () => {
    const res = await apple.check('steve@icloud.com');
    assert.equal(res.exists, true);
    assert.equal(res.metadata?.extra?.nativeAppleDomain, true);
  });

  it('Patreon deve identificar conta confirmada via credentials-lookup mock', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 200,
      text: async () => JSON.stringify({
        data: {
          id: '12345',
          attributes: { has_password: true, status: 'exists' }
        }
      })
    });

    try {
      const res = await patreon.check('test@example.com');
      assert.equal(res.exists, true);
      assert.equal(res.metadata?.extra?.verifiedByEmail, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('devRant deve identificar confirmação de envio no password reset', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 200,
      text: async () => JSON.stringify({ success: true, message: 'Reset email sent' })
    });

    try {
      const res = await devrant.check('dev@example.com');
      assert.equal(res.exists, true);
      assert.equal(res.metadata?.extra?.verifiedByEmail, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('About.me deve identificar retorno positivo no check_email', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 200,
      text: async () => JSON.stringify({ exists: true, status: 'taken' })
    });

    try {
      const res = await aboutme.check('user@example.com');
      assert.equal(res.exists, true);
      assert.equal(res.metadata?.extra?.verifiedByEmail, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

