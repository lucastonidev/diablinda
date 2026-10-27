/**
 * @fileoverview Módulo CodePen.
 * Realiza verificação DIRETA de e-mail no fluxo de redefinição de conta do CodePen e extração de perfil de autor.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'codepen',
  name: 'CodePen',
  category: 'tech',
  url: 'https://codepen.io',
  description: 'Verifica existência de e-mail e projetos de front-end no CodePen.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail no endpoint de recuperação de senha do CodePen
    try {
      const resetUrl = 'https://codepen.io/accounts/forgot_password';
      const body = new URLSearchParams({ email });

      const res = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml',
          'Origin': 'https://codepen.io',
          'Referer': 'https://codepen.io/accounts/forgot_password'
        },
        body: body.toString(),
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200) {
        const notFound = bodyText.includes("Couldn't find an account") || bodyText.includes('No user found');
        const isSent = bodyText.includes('sent you an email') || bodyText.includes('Check your inbox');
        if (isSent && !notFound) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://codepen.io',
              extra: {
                verifiedByEmail: true,
                codepenAccount: true
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

    const url = `https://codepen.io/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://codepen.io/'
        },
        signal
      });

      const html = await res.text();

      if (res.status === 200) {
        if (isHtmlProfileNotFound(html, username)) {
          return { exists: false };
        }

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';

        // No CodePen real, o título é "[Nome ou Username] on CodePen"
        if (title.includes('on CodePen') && !title.includes('404') && (html.includes('class="profile-header') || html.includes('itemprop="name"'))) {
          const avatarMatch = html.match(/class="profile-avatar"[^>]*src="([^"]+)"/i) || html.match(/itemprop="image"[^>]*content="([^"]+)"/i);
          return {
            exists: true,
            metadata: {
              username,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl: url,
              extra: { platform: 'CodePen' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, html)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no CodePen' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
