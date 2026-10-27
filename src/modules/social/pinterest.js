/**
 * @fileoverview Módulo Pinterest.
 * Verifica a existência de conta registrada na rede social Pinterest.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

export default {
  id: 'pinterest',
  name: 'Pinterest',
  category: 'social',
  url: 'https://pinterest.com',
  description: 'Verifica existência de conta registrada no Pinterest.',

  async check(email, { signal, headers } = {}) {
    const url = `https://www.pinterest.com/_ng/resource/EmailExistsResource/get/?data=${encodeURIComponent(
      JSON.stringify({ options: { email } })
    )}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        signal
      });

      if (res.status === 429) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Pinterest' };
      }

      if (res.status === 200) {
        const data = await res.json();
        // Se a resposta indicar que o email já está em uso
        const exists = Boolean(data?.resource_response?.data === true || data?.resource_response?.data?.exists);

        return {
          exists
        };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};

