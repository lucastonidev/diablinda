/**
 * @fileoverview Módulo Deliveroo.
 * Plataforma global de entrega rápida e delivery de restaurantes.
 * Anti-Falso Positivo: Valida campo booleano `registered: true` em resposta JSON da API.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'deliveroo',
  name: 'Deliveroo',
  category: 'entertainment',
  url: 'https://deliveroo.com',
  description: 'Verifica existência de conta no aplicativo de delivery Deliveroo.',

  async check(email, { signal, headers } = {}) {
    const url = 'https://deliveroo.co.uk/orderapp/v1/check-email';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://deliveroo.co.uk',
          'Referer': 'https://deliveroo.co.uk/'
        },
        body: JSON.stringify({ email }),
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          if (data && data.registered === true) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://deliveroo.com',
                extra: { deliverooAccount: true }
              }
            };
          }
        } catch {
          return { exists: false };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Deliveroo' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
