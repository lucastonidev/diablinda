/**
 * @fileoverview Módulo Replit.
 * Consulta disponibilidade via GraphQL e perfil público de desenvolvedor no Replit.
 * Anti-Falso Positivo: Valida campo booleano `isEmailAvailable === false` ou perfil com markup de usuário.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'replit',
  name: 'Replit',
  category: 'tech',
  url: 'https://replit.com',
  description: 'Verifica existência de conta de desenvolvedor no Replit.',

  async check(email, { signal, headers } = {}) {
    const url = 'https://replit.com/graphql';

    try {
      // 1. Tenta via GraphQL oficial com headers idênticos ao front-end
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://replit.com',
          'Referer': 'https://replit.com/signup'
        },
        body: JSON.stringify({
          query: `query CheckEmailAvailability($email: String!) { isEmailAvailable(email: $email) }`,
          variables: { email }
        }),
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200) {
        try {
          const json = JSON.parse(bodyText);
          const isAvailable = json?.data?.isEmailAvailable;
          if (isAvailable === false) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://replit.com',
                extra: { replitAccount: true }
              }
            };
          }
          if (isAvailable === true) {
            return { exists: false };
          }
        } catch {
          // segue para fallback de perfil
        }
      }

      // 2. Fallback de perfil público caso o GraphQL retorne WAF ou bloqueio
      const username = getEmailUsername(email);
      if (username) {
        const profileUrl = `https://replit.com/@${encodeURIComponent(username)}`;
        const profRes = await fetch(profileUrl, {
          headers: {
            ...headers,
            'Accept': 'text/html',
            'Referer': 'https://replit.com/'
          },
          signal
        });

        if (profRes.status === 200) {
          const profText = await profRes.text();
          if (!isWafOrBlocked(profRes, profText) && (profText.includes(`replit.com/@${username}`) || profText.includes('"user":{'))) {
            return {
              exists: true,
              metadata: {
                username,
                profileUrl,
                extra: { platform: 'Replit' }
              }
            };
          }
        }
      }

      // Só reporta WAF se o GraphQL e o perfil falharem por WAF evidente
      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Replit' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
