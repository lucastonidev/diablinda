/**
 * @fileoverview Módulo Internet Archive (Archive.org).
 * Consulta DIRETA de existência de e-mail na biblioteca digital Archive.org.
 * Anti-Falso Positivo: Valida mensagem explícita de e-mail já registrado (`status: error`).
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'archive',
  name: 'Internet Archive',
  category: 'tech',
  url: 'https://archive.org',
  description: 'Verifica se o e-mail possui conta registrada no Archive.org.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail no endpoint oficial de signup
    try {
      const checkUrl = 'https://archive.org/account/signup.php';
      const body = new URLSearchParams({
        action: 'check_email',
        email: email
      });

      const res = await fetch(checkUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json, text/javascript, */*',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://archive.org',
          'Referer': 'https://archive.org/account/signup'
        },
        body: body.toString(),
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          // Se o e-mail já estiver cadastrado:
          // Archive.org responde com status 'error' e mensagem 'Email address is already in use'
          if (data?.status === 'error' && (data.message?.toLowerCase().includes('already in use') || data.message?.toLowerCase().includes('already registered'))) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://archive.org',
                extra: {
                  verifiedByEmail: true,
                  archiveAccount: true
                }
              }
            };
          }

          if (data?.status === 'ok') {
            return { exists: false };
          }
        } catch {
          // segue para fallback
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de usuário público
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://archive.org/services/users/@${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'application/json'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Archive.org' };
      }

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          const item = data?.item;
          if (item && item.username) {
            return {
              exists: true,
              metadata: {
                username: item.username,
                name: item.screenname,
                avatarUrl: item.avatar ? `https://archive.org${item.avatar}` : undefined,
                profileUrl: `https://archive.org/details/@${item.username}`,
                bio: item.bio,
                extra: {
                  created: item.created
                }
              }
            };
          }
        } catch {
          return { exists: false };
        }
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
