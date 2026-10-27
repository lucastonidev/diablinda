/**
 * @fileoverview Módulo About.me.
 * Página de perfil pessoal e biografia unificada online.
 * Anti-Falso Positivo: Validação direta de e-mail e markup de perfil individual com rejeição de soft-404.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'aboutme',
  name: 'About.me',
  category: 'social',
  url: 'https://about.me',
  description: 'Verifica biografia pública e cartão digital de apresentação no About.me.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail no endpoint de checagem do About.me
    try {
      const checkUrl = `https://about.me/api/v2/json/user/exists?email=${encodeURIComponent(email)}`;
      const resCheck = await fetch(checkUrl, {
        headers: {
          ...headers,
          'Accept': 'application/json',
          'Origin': 'https://about.me',
          'Referer': 'https://about.me/signup'
        },
        signal
      });

      if (resCheck.status === 200) {
        const textCheck = await resCheck.text();
        try {
          const json = JSON.parse(textCheck);
          if (json?.exists === true || json?.status === 'taken' || json?.user_exists === true) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://about.me',
                extra: {
                  verifiedByEmail: true,
                  aboutmeAccount: true
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

    // 2. Fallback por perfil público
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://about.me/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://about.me/'
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

        if (!title.includes('Page Not Found') && (bodyText.includes('itemprop="name"') || bodyText.includes('class="name"') || title.includes(username))) {
          const nameMatch = bodyText.match(/meta property="og:title" content="([^"]+)"/i) || bodyText.match(/class="name"[^>]*>([^<]+)</i);
          const avatarMatch = bodyText.match(/meta property="og:image" content="([^"]+)"/i);
          const bioMatch = bodyText.match(/meta property="og:description" content="([^"]+)"/i);

          return {
            exists: true,
            metadata: {
              username,
              name: nameMatch ? nameMatch[1].trim() : undefined,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              bio: bioMatch ? bioMatch[1].trim() : undefined,
              profileUrl: url,
              extra: { platform: 'About.me' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no About.me' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
