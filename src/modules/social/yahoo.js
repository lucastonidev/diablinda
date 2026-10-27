/**
 * @fileoverview Módulo Yahoo / AOL.
 * Endpoint de descoberta e recuperação de conta do Yahoo.
 * Anti-Falso Positivo: Valida resposta estruturada do módulo de login/recuperação do Yahoo.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'yahoo',
  name: 'Yahoo',
  category: 'social',
  url: 'https://yahoo.com',
  description: 'Verifica existência de conta de e-mail e serviços no Yahoo.',

  async check(email, { signal, headers } = {}) {
    const url = 'https://login.yahoo.com/account/module/lookup';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json, text/plain, */*',
          'Origin': 'https://login.yahoo.com',
          'Referer': 'https://login.yahoo.com/'
        },
        body: `acrumb=&username=${encodeURIComponent(email)}`,
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Yahoo' };
      }

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          // Se o Yahoo redireciona para challenge de senha ou não reporta erro de 'INVALID_USERNAME'
          const hasError = data?.errors?.some((e) => e.name === 'username' || e.code === 'INVALID_USERNAME');
          if (!hasError && (data?.render || data?.status === 'ok' || data?.challenge)) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://login.yahoo.com',
                extra: { yahooAccount: true }
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

