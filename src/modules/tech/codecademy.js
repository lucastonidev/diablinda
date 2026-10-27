/**
 * @fileoverview Módulo Codecademy.
 * Plataforma educacional de programação e tecnologia.
 * Anti-Falso Positivo: Detecta soft-404 ("Profile Not Found", "This profile could not be found")
 * e nunca valida apenas por links canônicos presentes no HTML.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'codecademy',
  name: 'Codecademy',
  category: 'tech',
  url: 'https://codecademy.com',
  description: 'Verifica perfil e progresso de aprendizado no Codecademy.',

  async check(email, { signal, headers } = {}) {
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const profileUrl = `https://www.codecademy.com/profiles/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(profileUrl, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.codecademy.com/'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Codecademy' };
      }

      if (res.status === 200) {
        // Validação estrita: se for soft-404 ("Profile Not Found" ou "This profile could not be found")
        if (isHtmlProfileNotFound(bodyText, username)) {
          return { exists: false };
        }

        // Prova positiva: título com o nome/username e elementos reais de perfil
        const titleMatch = bodyText.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';

        const hasValidTitle = title.toLowerCase().includes(username.toLowerCase()) && !title.includes('Not Found');
        const hasUserData = bodyText.includes('data-testid="profile-header"') || bodyText.includes('"user":{') || bodyText.includes('class="gamut-');

        if (hasValidTitle && hasUserData) {
          const avatarMatch = bodyText.match(/class="[^"]*avatar[^"]*"[^>]*src="([^"]+)"/i) || bodyText.match(/property="og:image" content="([^"]+)"/i);
          return {
            exists: true,
            metadata: {
              username,
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl,
              extra: { platform: 'Codecademy' }
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
