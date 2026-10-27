/**
 * @fileoverview Módulo Tumblr.
 * Verifica a existência de conta ou blog no Tumblr.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

export default {
  id: 'tumblr',
  name: 'Tumblr',
  category: 'social',
  url: 'https://tumblr.com',
  description: 'Verifica existência de conta no Tumblr.',

  async check(email, { signal, headers } = {}) {
    const url = 'https://www.tumblr.com/svc/account/register';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ email, check: 1 }),
        signal
      });

      if (res.status === 429) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Tumblr' };
      }

      if (res.status === 200 || res.status === 400) {
        const text = await res.text();
        const exists = text.includes('already taken') || text.includes('already exists') || text.includes('email_taken');

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

