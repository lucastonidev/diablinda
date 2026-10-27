/**
 * @fileoverview Módulo Adobe ID.
 * Endpoint de descoberta de contas Adobe Creative Cloud e Document Cloud.
 * Anti-Falso Positivo: Valida array estruturado `accounts` com ao menos uma conta registrada.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'adobe',
  name: 'Adobe Creative Cloud',
  category: 'productivity',
  url: 'https://adobe.com',
  description: 'Verifica contas registradas no Adobe Creative Cloud e serviços Adobe.',

  async check(email, { signal, headers } = {}) {
    const url = 'https://auth.services.adobe.com/signin/v2/users/accounts';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Adobe-App-Id': 'signin_v2'
        },
        body: JSON.stringify({ username: email }),
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit na Adobe' };
      }

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          if (Array.isArray(data?.accounts) && data.accounts.length > 0) {
            const acc = data.accounts[0];
            return {
              exists: true,
              metadata: {
                name: acc.accountName || acc.displayName,
                profileUrl: 'https://account.adobe.com',
                extra: {
                  accountType: acc.accountType,
                  countryCode: acc.countryCode
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

