/**
 * @fileoverview Módulo Venmo.
 * Realiza verificação DIRETA de e-mail na API de verificação do Venmo e extração de perfil público.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'venmo',
  name: 'Venmo',
  category: 'finance',
  url: 'https://venmo.com',
  description: 'Verifica existência de e-mail e perfis de pagamento no Venmo.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail na API do Venmo
    try {
      const emailUrl = `https://account.venmo.com/api/user/email-check?email=${encodeURIComponent(email)}`;
      const emailRes = await fetch(emailUrl, {
        headers: {
          ...headers,
          'Accept': 'application/json',
          'Origin': 'https://account.venmo.com',
          'Referer': 'https://account.venmo.com/'
        },
        signal
      });

      if (emailRes.status === 200) {
        const data = await emailRes.json();
        if (data?.exists === true) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://account.venmo.com',
              extra: {
                verifiedByEmail: true,
                venmoAccount: true
              }
            }
          };
        }
        if (data?.exists === false) {
          return { exists: false };
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de perfil público
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const profileUrl = `https://account.venmo.com/u/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(profileUrl, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://account.venmo.com/'
        },
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200) {
        if (isHtmlProfileNotFound(bodyText, username)) {
          return { exists: false };
        }

        const titleMatch = bodyText.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';

        if (!title.includes('Not Found') && (bodyText.includes('payment-button') || bodyText.includes('profile-header') || title.includes(username))) {
          const avatarMatch = bodyText.match(/meta property="og:image" content="([^"]+)"/i);
          const nameMatch = bodyText.match(/meta property="og:title" content="([^"]+)"/i);

          return {
            exists: true,
            metadata: {
              username,
              name: nameMatch ? nameMatch[1].replace('@' + username, '').trim() : undefined,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl,
              extra: { platform: 'Venmo' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Venmo' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
