/**
 * @fileoverview Módulo Docker Hub.
 * Investiga perfil e existência de e-mail no Docker Hub.
 * Anti-Falso Positivo: Valida JSON estruturado do Docker Hub e ID do usuário.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'docker',
  name: 'Docker Hub',
  category: 'tech',
  url: 'https://hub.docker.com',
  description: 'Verifica existência de desenvolvedor e perfil no Docker Hub.',

  async check(email, { signal, headers } = {}) {
    // 1. Tenta verificação direta de e-mail via endpoint de recuperação de senha
    try {
      const resetUrl = 'https://hub.docker.com/v2/users/password/reset/';
      const res = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://hub.docker.com',
          'Referer': 'https://hub.docker.com/reset-password'
        },
        body: JSON.stringify({ email }),
        signal
      });

      if (res.status === 200 || res.status === 204) {
        return {
          exists: true,
          metadata: {
            profileUrl: 'https://hub.docker.com',
            extra: {
              verifiedByEmail: true,
              dockerHubAccount: true
            }
          }
        };
      }

      if (res.status === 404) {
        // e-mail não encontrado no Docker Hub
        return { exists: false };
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de API pública de usuário
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://hub.docker.com/v2/users/${encodeURIComponent(username)}/`;

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
        return { exists: false, rateLimited: true, error: 'Rate limit no Docker Hub' };
      }

      if (res.status === 200) {
        try {
          const user = JSON.parse(bodyText);
          if (user && user.id && user.username) {
            return {
              exists: true,
              metadata: {
                username: user.username,
                name: user.full_name,
                location: user.location,
                avatarUrl: user.gravatar_url,
                profileUrl: `https://hub.docker.com/u/${user.username}`,
                accountCreatedAt: user.date_joined,
                extra: {
                  dockerId: user.id
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
