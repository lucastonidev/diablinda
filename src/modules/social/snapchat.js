/**
 * @fileoverview Módulo Snapchat.
 * Realiza verificação DIRETA de e-mail no fluxo de recuperação do Snapchat e extração de Bitmoji/Perfil.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'snapchat',
  name: 'Snapchat',
  category: 'social',
  url: 'https://snapchat.com',
  description: 'Verifica existência de e-mail e perfis de criadores/Bitmoji no Snapchat.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail no endpoint de solicitação de redefinição de senha
    try {
      const resetUrl = 'https://accounts.snapchat.com/accounts/password_reset_request';
      const body = new URLSearchParams({ email });

      const res = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml',
          'Origin': 'https://accounts.snapchat.com',
          'Referer': 'https://accounts.snapchat.com/accounts/password_reset_request'
        },
        body: body.toString(),
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200) {
        const notFound = bodyText.includes('Email address is invalid') || bodyText.includes('We could not find an account');
        const isSent = bodyText.includes('check your inbox') || bodyText.includes('We sent you an email');
        if (isSent && !notFound) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://snapchat.com',
              extra: {
                verifiedByEmail: true,
                snapchatAccount: true
              }
            }
          };
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de perfil público e Bitmoji
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://www.snapchat.com/add/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.snapchat.com/'
        },
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200) {
        if (isHtmlProfileNotFound(bodyText, username)) {
          return { exists: false };
        }

        const isUserPage = (bodyText.includes('userProfile') || bodyText.includes('Bitmoji')) && bodyText.includes(`snapchat.com/add/${username}`);
        if (isUserPage) {
          const avatarMatch = bodyText.match(/class="[^"]*bitmoji[^"]*"[^>]*src="([^"]+)"/i) || bodyText.match(/content="([^"]*cf-st.sc-cdn.net[^"]*)"/i);
          return {
            exists: true,
            metadata: {
              username,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl: url,
              extra: { platform: 'Snapchat' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Snapchat' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
