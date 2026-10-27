/**
 * @fileoverview Módulo Atlassian (Jira, Confluence, Trello, Bitbucket).
 * Verifica se a conta corporativa ou individual existe no Atlassian Access.
 * Anti-Falso Positivo: Valida tipo de conta ou identifier retornado no JSON.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'atlassian',
  name: 'Atlassian',
  category: 'tech',
  url: 'https://atlassian.com',
  description: 'Verifica contas no ecossistema Atlassian (Jira, Confluence, Trello).',

  async check(email, { signal, headers } = {}) {
    const url = 'https://auth.atlassian.com/username';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ username: email }),
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Atlassian' };
      }

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          if (data && (data.accountType || data.identifier || data.status === 'valid')) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://id.atlassian.com',
                extra: {
                  accountType: data.accountType,
                  hasSso: Boolean(data.sso)
                }
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

