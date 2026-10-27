/**
 * @fileoverview Módulo Wattpad.
 * Maior plataforma online de leitura de histórias e publicação de livros.
 * Anti-Falso Positivo: Valida retorno booleano `email: false` com mensagem de erro `already taken`.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'wattpad',
  name: 'Wattpad',
  category: 'social',
  url: 'https://wattpad.com',
  description: 'Verifica existência de conta de autor ou leitor no Wattpad.',

  async check(email, { signal, headers } = {}) {
    const url = `https://www.wattpad.com/api/v3/users/validate?email=${encodeURIComponent(email)}`;

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
        return { exists: false, rateLimited: true, error: 'Rate limit no Wattpad' };
      }

      if (res.status === 200 || res.status === 400) {
        try {
          const data = JSON.parse(bodyText);
          const isTaken = data.email === false || (Array.isArray(data.errors) && data.errors.some((e) => typeof e === 'string' && e.toLowerCase().includes('already taken')));
          if (isTaken) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://www.wattpad.com',
                extra: { wattpadRegistered: true }
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

