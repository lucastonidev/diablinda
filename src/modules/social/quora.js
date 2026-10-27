/**
 * @fileoverview Módulo Quora.
 * Realiza verificação DIRETA de e-mail no fluxo de redefinição de senha da Quora e extração de perfil público.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'quora',
  name: 'Quora',
  category: 'social',
  url: 'https://quora.com',
  description: 'Verifica se o e-mail possui conta de autor e respostas no Quora.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail no endpoint de redefinição de senha da Quora
    try {
      const resetUrl = 'https://www.quora.com/web/api/send_password_reset_email';
      const body = new URLSearchParams({ email });

      const res = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json, text/plain, */*',
          'Origin': 'https://www.quora.com',
          'Referer': 'https://www.quora.com/'
        },
        body: body.toString(),
        signal
      });

      if (res.status === 200) {
        const text = await res.text();
        // Quora responde com JSON ou status indicando envio quando a conta existe
        if (!text.includes('invalid_email') && !text.includes('No user found') && (text.includes('"success":true') || text.includes('sent') || text.includes('ok'))) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://quora.com',
              extra: {
                verifiedByEmail: true,
                quoraAccount: true
              }
            }
          };
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de perfil público via cabeçalhos móveis
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://www.quora.com/profile/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.quora.com/'
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

        if (!title.includes('Not Found') && (bodyText.includes('"profile":{') || bodyText.includes('q-box') || title.includes(username))) {
          const avatarMatch = bodyText.match(/meta property="og:image" content="([^"]+)"/i);
          return {
            exists: true,
            metadata: {
              username,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl: url,
              extra: { platform: 'Quora' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Quora' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
