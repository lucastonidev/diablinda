/**
 * @fileoverview Módulo Chess.com.
 * Realiza verificação DIRETA de e-mail na API do Chess.com e extração de perfil enxadrista.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'chesscom',
  name: 'Chess.com',
  category: 'education',
  url: 'https://www.chess.com',
  description: 'Verifica se o e-mail possui conta e perfil enxadrista no Chess.com.',

  async check(email, { signal, headers } = {}) {
    let emailConfirmed = false;

    // 1. Verificação DIRETA por e-mail no endpoint oficial de disponibilidade do Chess.com
    try {
      const emailCheckUrl = `https://www.chess.com/callback/email/available?email=${encodeURIComponent(email)}`;
      const emailRes = await fetch(emailCheckUrl, {
        headers: {
          ...headers,
          'Accept': 'application/json, text/plain, */*',
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': 'https://www.chess.com/register'
        },
        signal
      });

      if (emailRes.status === 200) {
        const text = (await emailRes.text()).trim();
        // Se retornar false, o e-mail NÃO está disponível (ou seja, CONTA EXISTE!)
        if (text === 'false') {
          emailConfirmed = true;
        }
      }
    } catch {
      // segue para busca de perfil
    }

    // 2. Busca o perfil público de enxadrista
    const username = getEmailUsername(email);
    if (!username && !emailConfirmed) return { exists: false };

    const url = `https://api.chess.com/pub/player/${encodeURIComponent(username)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'application/json'
        },
        signal
      });

      if (isWafOrBlocked(res)) {
        if (emailConfirmed) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://www.chess.com',
              extra: { verifiedByEmail: true, chessAccount: true }
            }
          };
        }
        return { exists: false, rateLimited: true, error: 'Rate limit no Chess.com' };
      }

      if (res.status === 200) {
        const player = await res.json();
        let createdAt = undefined;
        if (player.joined) {
          createdAt = new Date(player.joined * 1000).toISOString();
        }

        return {
          exists: true,
          metadata: {
            name: player.name,
            username: player.username,
            avatarUrl: player.avatar,
            location: player.location,
            profileUrl: player.url,
            accountCreatedAt: createdAt,
            extra: {
              verifiedByEmail: emailConfirmed,
              title: player.title,
              followers: player.followers,
              isStreamer: player.is_streamer,
              status: player.status
            }
          }
        };
      }

      // Se o e-mail foi confirmado mas o perfil com o username exato não foi achado (handle diferente)
      if (emailConfirmed) {
        return {
          exists: true,
          metadata: {
            profileUrl: 'https://www.chess.com',
            extra: {
              verifiedByEmail: true,
              chessAccount: true
            }
          }
        };
      }

      return { exists: false };
    } catch (err) {
      if (emailConfirmed) {
        return {
          exists: true,
          metadata: {
            profileUrl: 'https://www.chess.com',
            extra: { verifiedByEmail: true }
          }
        };
      }
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
