/**
 * @fileoverview Módulo Samsung Account.
 * Verifica existência de conta no ecossistema Samsung (Smartphones, TVs, Galaxy Store, SmartThings).
 * Anti-Falso Positivo: Valida resposta da API de recuperação e registro da Samsung.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'samsung',
  name: 'Samsung Account',
  category: 'tech',
  url: 'https://samsung.com',
  description: 'Verifica existência de conta no ecossistema Samsung (Galaxy, SmartThings).',

  async check(email, { signal, headers } = {}) {
    const url = 'https://account.samsung.com/accounts/v1/MBR/checkEmail';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://account.samsung.com',
          'Referer': 'https://account.samsung.com/'
        },
        body: JSON.stringify({ email }),
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit na Samsung' };
      }

      if (res.status === 200 || res.status === 409) {
        try {
          const data = JSON.parse(bodyText);
          const exists = data?.isExist === true || data?.exist === true || data?.registered === true || res.status === 409;
          if (exists) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://account.samsung.com',
                extra: { samsungAccount: true }
              }
            };
          }
        } catch {
          if (res.status === 409) return { exists: true };
        }
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};

