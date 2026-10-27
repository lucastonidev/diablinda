/**
 * @fileoverview Módulo Strava.
 * Maior rede social e rastreador de atletas, ciclismo e corrida do mundo.
 * Anti-Falso Positivo: Valida retorno estrito do booleano `false` no endpoint `email_unique`.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'strava',
  name: 'Strava',
  category: 'social',
  url: 'https://strava.com',
  description: 'Verifica existência de conta de atleta no Strava.',

  async check(email, { signal, headers } = {}) {
    const url = 'https://www.strava.com/athletes/email_unique';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/plain, */*',
          'Origin': 'https://www.strava.com',
          'Referer': 'https://www.strava.com/register/free',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: `email=${encodeURIComponent(email)}`,
        signal
      });

      const bodyText = (await res.text()).trim();

      if (res.status === 200) {
        // Se retornar exatamente 'false', o e-mail NÃO é único (já existe conta)
        if (bodyText === 'false') {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://www.strava.com',
              extra: { stravaRegistered: true }
            }
          };
        }
        if (bodyText === 'true') {
          return { exists: false };
        }
      }

      // Fallback para perfil público de atleta caso o endpoint receba challenge
      const username = getEmailUsername(email);
      if (username) {
        const athleteUrl = `https://www.strava.com/athletes/${encodeURIComponent(username)}`;
        const athRes = await fetch(athleteUrl, {
          headers: {
            ...headers,
            'Referer': 'https://www.strava.com/'
          },
          signal
        });

        if (athRes.status === 200) {
          const athHtml = await athRes.text();
          if (!isWafOrBlocked(athRes, athHtml) && !athHtml.includes('Page Not Found') && athHtml.includes('athlete-name')) {
            return {
              exists: true,
              metadata: {
                username,
                profileUrl: athleteUrl,
                extra: { platform: 'Strava' }
              }
            };
          }
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Strava' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
