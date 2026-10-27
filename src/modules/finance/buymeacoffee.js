/**
 * @fileoverview Módulo Buy Me a Coffee.
 * Realiza verificação DIRETA de e-mail na API do BMC e extração de página de criador.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'buymeacoffee',
  name: 'Buy Me a Coffee',
  category: 'finance',
  url: 'https://buymeacoffee.com',
  description: 'Verifica existência de e-mail e página de criador no Buy Me a Coffee.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail na API de validação do Buy Me a Coffee
    try {
      const checkUrl = 'https://www.buymeacoffee.com/api/v1/check-email';
      const res = await fetch(checkUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://www.buymeacoffee.com',
          'Referer': 'https://www.buymeacoffee.com/signup'
        },
        body: JSON.stringify({ email }),
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          if (data?.available === false || data?.exists === true || data?.registered === true) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://buymeacoffee.com',
                extra: {
                  verifiedByEmail: true,
                  bmcAccount: true
                }
              }
            };
          }
        } catch {
          // segue para fallback
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de página pública do criador
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://www.buymeacoffee.com/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.buymeacoffee.com/'
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

        if (!title.includes('404') && (bodyText.includes('creator-profile') || bodyText.includes('supporters') || title.includes(username))) {
          const avatarMatch = bodyText.match(/meta property="og:image" content="([^"]+)"/i);
          const nameMatch = bodyText.match(/meta property="og:title" content="([^"]+)"/i);
          const bioMatch = bodyText.match(/meta property="og:description" content="([^"]+)"/i);

          return {
            exists: true,
            metadata: {
              username,
              name: nameMatch ? nameMatch[1].replace('is creating', '').trim() : undefined,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              bio: bioMatch ? bioMatch[1].trim() : undefined,
              profileUrl: url,
              extra: { platform: 'Buy Me a Coffee' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Buy Me a Coffee' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
