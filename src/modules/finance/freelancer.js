/**
 * @fileoverview Módulo Freelancer.com.
 * Maior plataforma global de contratação de profissionais autônomos e freelancers.
 * Anti-Falso Positivo: Valida campo explícito `result.available: false` em resposta JSON com status success.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'freelancer',
  name: 'Freelancer.com',
  category: 'finance',
  url: 'https://freelancer.com',
  description: 'Verifica contas de profissionais e contratantes no Freelancer.com.',

  async check(email, { signal, headers } = {}) {
    const url = `https://www.freelancer.com/api/users/0.1/users/check?email=${encodeURIComponent(email)}`;

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
        return { exists: false, rateLimited: true, error: 'Rate limit no Freelancer' };
      }

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          if (data && data.status === 'success' && data.result?.available === false) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://www.freelancer.com',
                extra: { freelancerAccount: true }
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

