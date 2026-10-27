/**
 * @fileoverview Módulo Telegram.
 * Plataforma global de mensagens instantâneas e canais.
 * Anti-Falso Positivo:
 * 1. Valida estrutura pública de perfil t.me.
 * 2. Extrai nome de exibição, avatar HD e biografia pública.
 * 3. Descarta links que não possuem perfil ativo associado.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'telegram',
  name: 'Telegram',
  category: 'social',
  url: 'https://telegram.org',
  description: 'Verifica perfis públicos e canais no Telegram (t.me), extraindo foto, bio e nome.',

  async check(email, { signal, headers } = {}) {
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://t.me/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://t.me/'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Telegram' };
      }

      if (res.status === 200) {
        // 1. Assinaturas oficiais de página sem usuário no Telegram (Sherlock OSINT)
        const isNotFound = bodyText.includes('If you have <strong>Telegram</strong>, you can contact') ||
                           bodyText.includes('If you have Telegram, you can contact') ||
                           bodyText.includes('<title>Telegram Messenger</title>') ||
                           bodyText.includes('tgme_username_link');

        if (isNotFound) {
          return { exists: false };
        }

        // 2. Extração de elementos reais de perfil
        const nameMatch = bodyText.match(/class="tgme_page_title"[^>]*><span[^>]*>([^<]+)<\/span>/i) ||
                          bodyText.match(/class="tgme_page_title"[^>]*>([^<]+)<\/div>/i);
        const avatarMatch = bodyText.match(/class="tgme_page_photo_image"[^>]*src="([^"]+)"/i) ||
                            bodyText.match(/property="og:image"\s+content="([^"]*telesco\.pe[^"]*)"/i);
        const bioMatch = bodyText.match(/class="tgme_page_description"[^>]*>([\s\S]*?)<\/div>/i);
        const extraMatch = bodyText.match(/class="tgme_page_extra"[^>]*>([\s\S]*?)<\/div>/i);

        let name = nameMatch ? nameMatch[1].trim() : undefined;
        const avatarUrl = avatarMatch ? avatarMatch[1] : undefined;
        let bio = bioMatch ? bioMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;
        const extra = extraMatch ? extraMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;

        // Se o nome começar com "Telegram: Contact" ou for genérico, descarta pois não é usuário real
        if (name && (name.startsWith('Telegram: Contact') || name.startsWith('Telegram Messenger'))) {
          name = undefined;
        }

        // Descarta mensagens de placeholder como biografia
        if (bio && (bio.includes('If you have Telegram') || bio.includes('You can contact'))) {
          bio = undefined;
        }

        // Prova positiva rigorosa: Deve ter um nome real próprio OU um avatar real hospedado
        const hasPositiveProof = (name && name.length > 0) || avatarUrl || (extra && (extra.includes('members') || extra.includes('subscribers')));

        if (hasPositiveProof) {
          return {
            exists: true,
            metadata: {
              username,
              name: name || username,
              avatarUrl,
              bio,
              profileUrl: url,
              extra: {
                platform: 'Telegram',
                members: extra
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

