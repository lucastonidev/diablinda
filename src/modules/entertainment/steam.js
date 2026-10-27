/**
 * @fileoverview Módulo Steam Community (Valve).
 * Maior plataforma de jogos para PC do mundo.
 * Anti-Falso Positivo:
 * 1. Valida perfil de jogador no Steam Community.
 * 2. Extrai persona name, nome real, avatar HD, biografia e país.
 * 3. Descarta soft-404 ("The specified profile could not be found").
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'steam',
  name: 'Steam (Valve)',
  category: 'entertainment',
  url: 'https://steamcommunity.com',
  description: 'Verifica perfis de jogadores na Steam Community, extraindo nickname, foto, país e nome real.',

  async check(email, { signal, headers } = {}) {
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://steamcommunity.com/id/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://steamcommunity.com/'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit na Steam' };
      }

      if (res.status === 200) {
        if (isHtmlProfileNotFound(bodyText, username)) {
          return { exists: false };
        }

        const isNotFound = bodyText.includes('The specified profile could not be found') ||
                           bodyText.includes('O perfil especificado não pôde ser encontrado') ||
                           bodyText.includes('class="profile_fatalerror"');

        if (!isNotFound && (bodyText.includes('class="actual_persona_name"') || bodyText.includes('playerAvatarAutoSizeInner'))) {
          const personaMatch = bodyText.match(/class="actual_persona_name"[^>]*>([^<]+)<\/span>/i) ||
                               bodyText.match(/property="og:title"\s+content="Steam Community :: ([^"]+)"/i);
          const realNameMatch = bodyText.match(/class="header_real_name[^"]*"[^>]*><bdi>([^<]+)<\/bdi>/i);
          const avatarMatch = bodyText.match(/class="playerAvatarAutoSizeInner"[^>]*><img[^>]*src="([^"]+)"/i) ||
                              bodyText.match(/property="og:image"\s+content="([^"]+)"/i);
          const bioMatch = bodyText.match(/class="profile_summary"[^>]*>([\s\S]*?)<\/div>/i);
          const countryMatch = bodyText.match(/class="profile_flag"[^>]*>\s*([A-Za-z\s]+)/i);

          const persona = personaMatch ? personaMatch[1].trim() : username;
          const realName = realNameMatch ? realNameMatch[1].trim() : undefined;
          const avatarUrl = avatarMatch ? avatarMatch[1].replace(/_medium\./, '_full.') : undefined;
          const bio = bioMatch ? bioMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;
          const location = countryMatch ? countryMatch[1].trim() : undefined;

          return {
            exists: true,
            metadata: {
              username,
              name: realName ? `${persona} (${realName})` : persona,
              avatarUrl,
              bio,
              location,
              profileUrl: url,
              extra: {
                platform: 'Steam',
                personaName: persona,
                realName
              }
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

