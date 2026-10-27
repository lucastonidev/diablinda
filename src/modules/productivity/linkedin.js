/**
 * @fileoverview Módulo LinkedIn (Microsoft).
 * Maior rede social e plataforma profissional e de carreira do mundo.
 * Anti-Falso Positivo:
 * 1. Valida perfil público profissional no LinkedIn.
 * 2. Extrai nome, cargo/empresa, foto de perfil HD e biografia profissional.
 * 3. Descarta authwalls genéricos e erros 404.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'linkedin',
  name: 'LinkedIn',
  category: 'productivity',
  url: 'https://linkedin.com',
  description: 'Verifica perfis profissionais no LinkedIn, extraindo nome, cargo, foto e histórico público.',

  async check(email, { signal, headers } = {}) {
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://www.linkedin.com/in/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.google.com/'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Authwall / Rate limit no LinkedIn' };
      }

      if (res.status === 200) {
        if (isHtmlProfileNotFound(bodyText, username)) {
          return { exists: false };
        }

        const titleMatch = bodyText.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';

        const isNotFound = title.includes('Page not found') ||
                           title.includes('Sign In') ||
                           title.includes('Entrar') ||
                           bodyText.includes('authwall') ||
                           title.includes('404');

        if (!isNotFound && title.includes('LinkedIn') && (title.includes(username) || bodyText.includes('property="og:title"'))) {
          const ogTitle = bodyText.match(/property="og:title"\s+content="([^"]+)"/i)?.[1];
          const ogImage = bodyText.match(/property="og:image"\s+content="([^"]+)"/i)?.[1];
          const ogDesc = bodyText.match(/property="og:description"\s+content="([^"]+)"/i)?.[1];

          // Formato típico de título do LinkedIn: "Lucas Silva - Software Engineer - Tech Corp | LinkedIn"
          let name = ogTitle ? ogTitle.split(' - ')[0]?.trim() : title.split(' - ')[0]?.trim();
          if (name.includes('|')) name = name.split('|')[0].trim();

          return {
            exists: true,
            metadata: {
              username,
              name,
              avatarUrl: ogImage && !ogImage.includes('ghost_person') ? ogImage : undefined,
              bio: ogDesc,
              profileUrl: url,
              extra: { platform: 'LinkedIn' }
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

