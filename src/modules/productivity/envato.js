/**
 * @fileoverview Módulo Envato (ThemeForest, CodeCanyon, Elements).
 * Realiza verificação DIRETA de e-mail no fluxo de recuperação de conta e extração de perfil de autor.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'envato',
  name: 'Envato Market',
  category: 'productivity',
  url: 'https://envato.com',
  description: 'Verifica se o e-mail possui conta no ecossistema Envato (ThemeForest, CodeCanyon).',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail no endpoint de recuperação de senha da Envato
    try {
      const resetUrl = 'https://account.envato.com/reset_password';
      const body = new URLSearchParams({ email });

      const res = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml',
          'Origin': 'https://account.envato.com',
          'Referer': 'https://account.envato.com/reset_password'
        },
        body: body.toString(),
        signal
      });

      const bodyText = await res.text();

      // Se a página de resposta NÃO contiver erro de e-mail não encontrado e indicar sucesso de envio
      if (res.status === 200) {
        const notFound = bodyText.includes("couldn't find an account") || bodyText.includes('não encontramos') || bodyText.includes('invalid_email');
        const isSent = bodyText.includes('instructions to reset your password') || bodyText.includes('Check your inbox');
        if (isSent && !notFound) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://account.envato.com',
              extra: {
                verifiedByEmail: true,
                envatoAccount: true
              }
            }
          };
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de perfil público no ThemeForest
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const profileUrl = `https://themeforest.net/user/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(profileUrl, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://themeforest.net/'
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

        if (!title.includes('404') && (bodyText.includes('author-header') || bodyText.includes('user-info') || title.includes(username))) {
          const avatarMatch = bodyText.match(/class="avatar"[^>]*src="([^"]+)"/i) || bodyText.match(/meta property="og:image" content="([^"]+)"/i);
          return {
            exists: true,
            metadata: {
              username,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl,
              extra: { platform: 'Envato Market' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Envato' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
