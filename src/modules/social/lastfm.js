/**
 * @fileoverview Módulo Last.fm.
 * Realiza verificação DIRETA de e-mail através da API de validação de cadastro do Last.fm.
 * Anti-Falso Positivo: Valida a mensagem explícita 'This email is already registered'.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'lastfm',
  name: 'Last.fm',
  category: 'social',
  url: 'https://last.fm',
  description: 'Verifica existência de e-mail e histórico musical no Last.fm.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail no endpoint de cadastro
    try {
      const joinUrl = 'https://www.last.fm/join/partial';
      const body = new URLSearchParams({ email });

      const res = await fetch(joinUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json, text/plain, */*',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://www.last.fm',
          'Referer': 'https://www.last.fm/join'
        },
        body: body.toString(),
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200 || res.status === 400) {
        if (bodyText.includes('This email is already registered') || bodyText.includes('email_already_registered')) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://www.last.fm',
              extra: {
                verifiedByEmail: true,
                lastfmAccount: true
              }
            }
          };
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de perfil de ouvinte
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const profileUrl = `https://www.last.fm/user/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(profileUrl, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.last.fm/'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Last.fm' };
      }

      if (res.status === 200) {
        if (isHtmlProfileNotFound(bodyText, username)) {
          return { exists: false };
        }

        const isNotFound = bodyText.includes('User not found') || bodyText.includes('404 Page Not Found');
        if (!isNotFound && (bodyText.includes('header-title') || bodyText.includes('scrobbles'))) {
          const avatarMatch = bodyText.match(/class="avatar"[^>]*src="([^"]+)"/i) || bodyText.match(/property="og:image" content="([^"]+)"/i);
          return {
            exists: true,
            metadata: {
              username,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl,
              extra: { platform: 'Last.fm' }
            }
          };
        }
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
