/**
 * @fileoverview Módulo Patreon.
 * Maior plataforma de crowdfunding recorrente e assinaturas de criadores.
 * Anti-Falso Positivo: Realiza consulta direta no credentials-lookup e validação estrita de criador.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'patreon',
  name: 'Patreon',
  category: 'finance',
  url: 'https://patreon.com',
  description: 'Verifica contas de apoiador ou criador de conteúdo no Patreon.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail no endpoint de credenciais do Patreon
    try {
      const lookupUrl = 'https://www.patreon.com/api/credentials-lookup';
      const resLookup = await fetch(lookupUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://www.patreon.com',
          'Referer': 'https://www.patreon.com/login'
        },
        body: JSON.stringify({
          data: {
            email
          }
        }),
        signal
      });

      if (resLookup.status === 200) {
        const textLookup = await resLookup.text();
        try {
          const json = JSON.parse(textLookup);
          // O Patreon retorna se o e-mail tem senha, social login ou status existente
          const hasPassword = json?.data?.attributes?.has_password;
          const status = json?.data?.attributes?.status;
          const userExists = hasPassword !== undefined || status === 'exists' || json?.data?.id;

          if (userExists) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://www.patreon.com',
                extra: {
                  verifiedByEmail: true,
                  patreonAccount: true
                }
              }
            };
          }
        } catch {
          // segue para fallback
        }
      }
    } catch {
      // segue para fallback de perfil
    }

    // 2. Fallback de página pública do criador
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const creatorUrl = `https://www.patreon.com/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(creatorUrl, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.patreon.com/'
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

        if (!title.includes('404') && (bodyText.includes('"patron_count":') || bodyText.includes('campaign') || title.includes(username))) {
          const avatarMatch = bodyText.match(/meta property="og:image" content="([^"]+)"/i);
          const nameMatch = bodyText.match(/meta property="og:title" content="([^"]+)"/i);

          return {
            exists: true,
            metadata: {
              username,
              name: nameMatch ? nameMatch[1].trim() : undefined,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl: creatorUrl,
              extra: { platform: 'Patreon' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit / Cloudflare no Patreon' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
