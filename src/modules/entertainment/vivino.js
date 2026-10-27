/**
 * @fileoverview Módulo Vivino.
 * Realiza verificação DIRETA de e-mail na API do Vivino e extração de perfil público.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'vivino',
  name: 'Vivino',
  category: 'entertainment',
  url: 'https://vivino.com',
  description: 'Verifica existência de e-mail e perfil de apreciador de vinhos no Vivino.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail na API do Vivino
    try {
      const checkUrl = 'https://www.vivino.com/api/users/check_email';
      const res = await fetch(checkUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://www.vivino.com',
          'Referer': 'https://www.vivino.com/users/sign_up'
        },
        body: JSON.stringify({ email }),
        signal
      });

      if (res.status === 200 || res.status === 409) {
        const text = await res.text();
        if (text.includes('taken":true') || text.includes('exists":true') || text.includes('already registered') || res.status === 409) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://www.vivino.com',
              extra: {
                verifiedByEmail: true,
                vivinoAccount: true
              }
            }
          };
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de perfil público
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://www.vivino.com/users/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.vivino.com/'
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

        if (!title.includes('404') && (bodyText.includes('user-profile') || bodyText.includes('ratings-count') || title.includes(username))) {
          const avatarMatch = bodyText.match(/meta property="og:image" content="([^"]+)"/i);
          const nameMatch = bodyText.match(/meta property="og:title" content="([^"]+)"/i);

          return {
            exists: true,
            metadata: {
              username,
              name: nameMatch ? nameMatch[1].trim() : undefined,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl: url,
              extra: { platform: 'Vivino' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Vivino' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
