/**
 * @fileoverview Módulo TikTok.
 * Rede social de vídeos curtos mais popular do mundo.
 * Anti-Falso Positivo:
 * 1. Consulta metatags e estado de hidratação do TikTok (__UNIVERSAL_DATA_FOR_REHYDRATION__).
 * 2. Valida nickname, avatar HD, bio e contagem de seguidores/curtidas.
 * 3. Descarta soft-404 e perfis inexistentes (statusCode 10202).
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'tiktok',
  name: 'TikTok',
  category: 'social',
  url: 'https://tiktok.com',
  description: 'Verifica perfis no TikTok, extraindo nome de exibição, avatar HD, biografia e métricas públicas.',

  async check(email, { signal, headers } = {}) {
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const profileUrl = `https://www.tiktok.com/@${encodeURIComponent(username)}`;

    try {
      const res = await fetch(profileUrl, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.tiktok.com/'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit / Captcha no TikTok' };
      }

      if (res.status === 200) {
        if (isHtmlProfileNotFound(bodyText, username)) {
          return { exists: false };
        }

        // 1. Tenta extrair do JSON de hidratação nativo do TikTok
        const jsonMatch = bodyText.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i);
        if (jsonMatch) {
          try {
            const data = JSON.parse(jsonMatch[1]);
            const userDetail = data?.['__DEFAULT_SCOPE__']?.['webapp.user-detail'];
            const userInfo = userDetail?.userInfo?.user;
            const stats = userDetail?.userInfo?.stats;

            if (userInfo && userInfo.uniqueId) {
              return {
                exists: true,
                metadata: {
                  username: userInfo.uniqueId,
                  name: userInfo.nickname || userInfo.uniqueId,
                  avatarUrl: userInfo.avatarLarger || userInfo.avatarMedium,
                  bio: userInfo.signature,
                  profileUrl,
                  extra: {
                    platform: 'TikTok',
                    followers: stats?.followerCount,
                    following: stats?.followingCount,
                    likes: stats?.heartCount,
                    verified: userInfo.verified || false
                  }
                }
              };
            }
          } catch {
            // segue para fallback OpenGraph
          }
        }

        // 2. Fallback via OpenGraph tags
        const titleMatch = bodyText.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';

        const ogTitle = bodyText.match(/property="og:title"\s+content="([^"]+)"/i)?.[1];
        const ogImage = bodyText.match(/property="og:image"\s+content="([^"]+)"/i)?.[1];
        const ogDesc = bodyText.match(/property="og:description"\s+content="([^"]+)"/i)?.[1];

        const notFound = bodyText.includes("Couldn't find this account") ||
                         bodyText.includes('Não foi possível encontrar esta conta') ||
                         bodyText.includes('page not found') ||
                         title.includes('404');

        if (!notFound && ogTitle && (ogTitle.includes(`(@${username})`) || bodyText.includes(`"uniqueId":"${username}"`))) {
          return {
            exists: true,
            metadata: {
              username,
              name: ogTitle.split('(')[0]?.trim() || username,
              avatarUrl: ogImage,
              bio: ogDesc,
              profileUrl,
              extra: { platform: 'TikTok' }
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

