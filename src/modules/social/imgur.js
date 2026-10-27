/**
 * @fileoverview Módulo Imgur.
 * Realiza verificação DIRETA de e-mail na API de cadastro do Imgur e extração de perfil público.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'imgur',
  name: 'Imgur',
  category: 'social',
  url: 'https://imgur.com',
  description: 'Verifica existência de e-mail e galerias públicas no Imgur.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail na API do Imgur
    try {
      const verifyUrl = 'https://api.imgur.com/signin/v1/user/verify';
      const res = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Authorization': 'Client-ID 546c25a59c58ad7',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
        signal
      });

      if (res.status === 200) {
        const json = await res.json();
        // available === false significa que o e-mail JÁ ESTÁ CADASTRADO
        if (json?.data?.available === false) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://imgur.com',
              extra: {
                verifiedByEmail: true,
                imgurAccount: true
              }
            }
          };
        }
        if (json?.data?.available === true) {
          return { exists: false };
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de perfil público
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://api.imgur.com/account/v1/accounts/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Authorization': 'Client-ID 546c25a59c58ad7',
          'Accept': 'application/json'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Imgur' };
      }

      if (res.status === 200) {
        try {
          const json = JSON.parse(bodyText);
          const data = json?.data;
          if (data && data.url && data.id) {
            return {
              exists: true,
              metadata: {
                username: data.url,
                avatarUrl: data.avatar,
                bio: data.bio,
                profileUrl: `https://imgur.com/user/${data.url}`,
                extra: {
                  reputation: data.reputation,
                  created: data.created
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
