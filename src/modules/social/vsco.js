/**
 * @fileoverview Módulo VSCO.
 * Realiza verificação DIRETA de e-mail na API do VSCO e extração de galeria pública.
 * Anti-Falso Positivo: Valida retorno explícito de e-mail já cadastrado.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'vsco',
  name: 'VSCO',
  category: 'social',
  url: 'https://vsco.co',
  description: 'Verifica existência de e-mail e galerias de fotos no VSCO.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail na API de validação do VSCO
    try {
      const verifyUrl = 'https://vsco.co/api/2.0/users/verify';
      const res = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://vsco.co',
          'Referer': 'https://vsco.co/signup'
        },
        body: JSON.stringify({ email }),
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200 || res.status === 400 || res.status === 409) {
        if (bodyText.includes('already taken') || bodyText.includes('is_available":false') || bodyText.includes('email_taken')) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://vsco.co',
              extra: {
                verifiedByEmail: true,
                vscoAccount: true
              }
            }
          };
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de galeria pública
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://vsco.co/${encodeURIComponent(username)}/gallery`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://vsco.co/',
          'Origin': 'https://vsco.co'
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

        if (!title.includes('404') && (bodyText.includes('itemprop="creator"') || bodyText.includes('__VSCO_STATE__') || title.includes(username))) {
          const avatarMatch = bodyText.match(/meta property="og:image" content="([^"]+)"/i);
          return {
            exists: true,
            metadata: {
              username,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl: url,
              extra: { platform: 'VSCO' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no VSCO' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
