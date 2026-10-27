import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import office365 from '../src/modules/productivity/office365.js';

describe('Módulo Microsoft / Office 365 (Detecção de Contas Pessoais e Corporativas)', () => {
  it('deve detectar e-mail de terceiro (ex: Gmail) registrado como Conta Pessoal Microsoft (IsMSAccount: true)', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      if (url.includes('microsoftonline.com')) {
        return {
          status: 200,
          text: async () => JSON.stringify({
            Username: 'cmazini@gmail.com',
            IfExistsResult: 1, // 1 = não é conta corporativa, mas...
            IsMSAccount: true, // ...É CONTA PESSOAL MICROSOFT!
            Credentials: { HasPassword: true }
          })
        };
      }
      return { status: 404 };
    };

    try {
      const res = await office365.check('cmazini@gmail.com');
      assert.equal(res.exists, true, 'Deve identificar conta pessoal Microsoft via IsMSAccount');
      assert.equal(res.metadata.extra.isPersonalMSA, true);
      assert.ok(res.metadata.extra.microsoftAccountType.includes('Pessoal'));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve detectar conta corporativa ou nativa (IfExistsResult: 0)', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      if (url.includes('microsoftonline.com')) {
        return {
          status: 200,
          text: async () => JSON.stringify({
            Username: 'alvo@outlook.com',
            IfExistsResult: 0,
            IsMSAccount: true
          })
        };
      }
      return { status: 404 };
    };

    try {
      const res = await office365.check('alvo@outlook.com');
      assert.equal(res.exists, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve utilizar fallback do login.live.com se o endpoint principal falhar', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      if (url.includes('microsoftonline.com')) {
        return {
          status: 200,
          text: async () => JSON.stringify({
            Username: 'alvo@gmail.com',
            IfExistsResult: 1,
            IsMSAccount: false
          })
        };
      }
      if (url.includes('login.live.com')) {
        return {
          status: 200,
          text: async () => JSON.stringify({
            IfExistsResult: 0
          })
        };
      }
      return { status: 404 };
    };

    try {
      const res = await office365.check('alvo@gmail.com');
      assert.equal(res.exists, true, 'Fallback live.com deve confirmar a conta');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('deve retornar exists: false quando a conta não existe em nenhum endpoint', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return {
        status: 200,
        text: async () => JSON.stringify({
          IfExistsResult: 1,
          IsMSAccount: false
        })
      };
    };

    try {
      const res = await office365.check('naoexiste123456@gmail.com');
      assert.equal(res.exists, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

