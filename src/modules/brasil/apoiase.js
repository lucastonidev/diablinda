/**
 * @fileoverview Módulo Apoia.se Brasil.
 * Plataforma brasileira de crowdfunding contínuo e financiamento coletivo.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

export default {
  id: 'apoiase',
  name: 'Apoia.se',
  category: 'brasil',
  url: 'https://apoia.se',
  description: 'Verifica existência de conta de apoiador ou criador no Apoia.se.',

  async check(email, { signal, headers } = {}) {
    const url = `https://apoia.se/api/v1/users/check?email=${encodeURIComponent(email)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'application/json'
        },
        signal
      });

      if (res.status === 429) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Apoia.se' };
      }

      if (res.status === 200) {
        const data = await res.json();
        const exists = Boolean(data?.exists || data?.available === false);
        return { exists };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};

