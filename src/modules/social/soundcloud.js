/**
 * @fileoverview Módulo SoundCloud.
 * Plataforma global de streaming de áudio e música independente.
 * Anti-Falso Positivo: Valida estritamente o status `existing_user` na API de autenticação.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'soundcloud',
  name: 'SoundCloud',
  category: 'social',
  url: 'https://soundcloud.com',
  description: 'Verifica existência de conta cadastrada no SoundCloud.',

  async check(email, { signal, headers } = {}) {
    const url = 'https://api-auth.soundcloud.com/web-auth/identifier/lookup';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ identifier: email }),
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no SoundCloud' };
      }

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          if (data && data.status === 'existing_user') {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://soundcloud.com',
                extra: { soundcloudStatus: 'existing_user' }
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

