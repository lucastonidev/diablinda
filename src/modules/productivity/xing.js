/**
 * @fileoverview Módulo XING.
 * Realiza verificação DIRETA de e-mail no fluxo de recuperação do XING e extração de perfil profissional.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'xing',
  name: 'XING',
  category: 'productivity',
  url: 'https://xing.com',
  description: 'Verifica existência de e-mail e perfil de carreira corporativa no XING.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail no endpoint de recuperação de senha do XING
    try {
      const resetUrl = 'https://www.xing.com/auth/password/reset';
      const body = new URLSearchParams({ email });

      const res = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml',
          'Origin': 'https://www.xing.com',
          'Referer': 'https://www.xing.com/auth/password/reset'
        },
        body: body.toString(),
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200) {
        const notFound = bodyText.includes('Kein Benutzer mit dieser E-Mail') || bodyText.includes('No user found');
        const isSent = bodyText.includes('E-Mail gesendet') || bodyText.includes('email has been sent');
        if (isSent && !notFound) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://www.xing.com',
              extra: {
                verifiedByEmail: true,
                xingAccount: true
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

    const url = `https://www.xing.com/profile/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.xing.com/'
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

        if (!title.includes('404') && !title.includes('nicht gefunden') && (bodyText.includes('itemprop="name"') || bodyText.includes('profile-title') || title.includes(username))) {
          const avatarMatch = bodyText.match(/meta property="og:image" content="([^"]+)"/i);
          const nameMatch = bodyText.match(/meta property="og:title" content="([^"]+)"/i);

          return {
            exists: true,
            metadata: {
              username,
              name: nameMatch ? nameMatch[1].replace('– XING', '').trim() : undefined,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl: url,
              extra: { platform: 'XING' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no XING' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
