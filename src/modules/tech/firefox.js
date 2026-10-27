/**
 * @fileoverview Módulo Firefox Accounts (Mozilla).
 * Endpoint oficial de status de conta da Mozilla.
 * Anti-Falso Positivo: Verifica estritamente o campo booleano `exists: true` em resposta 200 JSON.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'firefox',
  name: 'Firefox / Mozilla',
  category: 'tech',
  url: 'https://firefox.com',
  description: 'Verifica se o e-mail possui conta Mozilla / Firefox Sync ativa.',

  async check(email, { signal, headers } = {}) {
    const url = 'https://api.accounts.firefox.com/v1/account/status';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Firefox Accounts' };
      }

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          if (data && data.exists === true) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://accounts.firefox.com',
                extra: {
                  firefoxAccount: true
                }
              }
            };
          }
        } catch {
          // JSON inválido: não arrisca falso positivo
          return { exists: false };
        }
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};

