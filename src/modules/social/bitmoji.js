/**
 * @fileoverview Módulo Bitmoji.
 * Criação e personalização de avatares animados.
 * Anti-Falso Positivo: Valida resposta JSON com booleano `exists: true`.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'bitmoji',
  name: 'Bitmoji',
  category: 'social',
  url: 'https://bitmoji.com',
  description: 'Verifica existência de avatar personalizado no Bitmoji.',

  async check(email, { signal, headers } = {}) {
    const url = 'https://api.bitmoji.com/user/email';

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
        return { exists: false, rateLimited: true, error: 'Rate limit no Bitmoji' };
      }

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          if (data && data.exists === true) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://bitmoji.com',
                extra: { bitmojiAccount: true }
              }
            };
          }
        } catch {
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

