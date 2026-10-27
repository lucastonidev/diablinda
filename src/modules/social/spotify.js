/**
 * @fileoverview Módulo Spotify.
 * Verifica a existência de conta cadastrada no ecossistema Spotify.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

export default {
  id: 'spotify',
  name: 'Spotify',
  category: 'entertainment',
  url: 'https://spotify.com',
  description: 'Verifica existência de conta cadastrada na plataforma Spotify.',

  async check(email, { signal, headers } = {}) {
    const url = `https://spclient.wg.spotify.com/signup/public/v1/account?validate=1&email=${encodeURIComponent(email)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'application/json'
        },
        signal
      });

      if (res.status === 429) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Spotify' };
      }

      if (res.status === 200) {
        const data = await res.json();
        // status 1 = disponível para registro (não existe conta)
        // status 20 = endereço de e-mail já registrado
        const exists = data?.status === 20 || data?.errors?.email === 'email_already_exists';

        return {
          exists,
          metadata: exists ? {
            extra: {
              spotifyStatus: data.status
            }
          } : undefined
        };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};

