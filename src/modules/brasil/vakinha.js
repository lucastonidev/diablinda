/**
 * @fileoverview Módulo Vakinha Brasil.
 * Plataforma brasileira de vaquinhas online e doações.
 * Verifica a existência de conta de usuário/arrecadador.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

export default {
  id: 'vakinha',
  name: 'Vakinha Brasil',
  category: 'brasil',
  url: 'https://www.vakinha.com.br',
  description: 'Verifica existência de conta no maior site de vaquinhas online do Brasil.',

  async check(email, { signal, headers } = {}) {
    const url = 'https://api.vakinha.com.br/v2/users/check-email';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
        signal
      });

      if (res.status === 429) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Vakinha' };
      }

      if (res.status === 200) {
        const data = await res.json();
        // Em muitas APIs, exists: true ou available: false
        const exists = Boolean(data?.exists || data?.available === false || data?.registered === true);
        return { exists };
      }

      if (res.status === 422 || res.status === 409) {
        return { exists: true };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};

