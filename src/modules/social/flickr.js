/**
 * @fileoverview Módulo Flickr.
 * Hospedagem e comunidade global de fotografia.
 * Anti-Falso Positivo: Valida photostream público, rejeita soft-404 e tags OpenGraph do Flickr.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'flickr',
  name: 'Flickr',
  category: 'social',
  url: 'https://flickr.com',
  description: 'Verifica photostream público e portfólio no Flickr.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA de e-mail na API do identity Flickr
    try {
      const idUrl = 'https://identity.flickr.com/check-email';
      const resId = await fetch(idUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://identity.flickr.com',
          'Referer': 'https://identity.flickr.com/'
        },
        body: JSON.stringify({ email }),
        signal
      });

      if (resId.status === 200) {
        const textId = await resId.text();
        try {
          const json = JSON.parse(textId);
          if (json?.exists === true || json?.isRegistered === true) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://flickr.com',
                extra: {
                  verifiedByEmail: true,
                  flickrAccount: true
                }
              }
            };
          }
        } catch {
          // segue para fallback
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback por photostream público
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://www.flickr.com/photos/${encodeURIComponent(username)}/`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.flickr.com/'
        },
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200) {
        if (isHtmlProfileNotFound(bodyText, username)) {
          return { exists: false };
        }

        const isNotFound = bodyText.includes('Page Not Found') || bodyText.includes('This user has no public photos') || bodyText.includes('404');
        if (!isNotFound && (bodyText.includes(`flickr.com/photos/${username}`) || bodyText.includes('class="photostream"') || bodyText.includes('property="og:title"'))) {
          const avatarMatch = bodyText.match(/class="avatar[^"]*"[^>]*src="([^"]+)"/i) || bodyText.match(/meta property="og:image" content="([^"]+)"/i);
          return {
            exists: true,
            metadata: {
              username,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl: url,
              extra: { platform: 'Flickr' }
            }
          };
        }
      }

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Flickr' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};

