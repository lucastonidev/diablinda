/**
 * @fileoverview Módulo Twitter / X.
 * Endpoint oficial da API web para verificação de disponibilidade de e-mail.
 * Anti-Falso Positivo: Valida estritamente `taken: true` e `valid: false`.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'twitter',
  name: 'Twitter / X',
  category: 'social',
  url: 'https://twitter.com',
  description: 'Verifica existência de conta vinculada ao e-mail no Twitter/X.',

  async check(email, { signal, headers } = {}) {
    const url = `https://api.twitter.com/i/users/email_available.json?email=${encodeURIComponent(email)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'application/json'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Twitter/X' };
      }

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          // Anti-falso positivo rigoroso
          if (data && data.taken === true && data.valid === false) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://twitter.com',
                extra: { twitterAccount: true }
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

