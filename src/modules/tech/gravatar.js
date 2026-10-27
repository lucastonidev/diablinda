/**
 * @fileoverview Módulo Gravatar / Automattic (WordPress).
 * Utiliza hashing MD5 e SHA-256 para checagem de perfil público e extração de avatar em HD.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { createHash } from 'node:crypto';

export default {
  id: 'gravatar',
  name: 'Gravatar / WordPress',
  category: 'tech',
  url: 'https://gravatar.com',
  description: 'Verifica avatar global e perfil público do WordPress / Gravatar.',

  async check(email, { signal, headers } = {}) {
    const md5Hash = createHash('md5').update(email).digest('hex');
    const sha256Hash = createHash('sha256').update(email).digest('hex');

    // 1. Tenta obter o perfil completo em formato JSON via endpoint público do Gravatar
    const profileUrl = `https://en.gravatar.com/${md5Hash}.json`;
    try {
      const res = await fetch(profileUrl, {
        headers: {
          ...headers,
          'Accept': 'application/json'
        },
        signal
      });

      if (res.status === 200) {
        const data = await res.json();
        const entry = data?.entry?.[0] || {};

        return {
          exists: true,
          metadata: {
            name: entry.displayName || entry.name?.formatted,
            username: entry.preferredUsername,
            avatarUrl: entry.thumbnailUrl || `https://www.gravatar.com/avatar/${sha256Hash}?s=400`,
            bio: entry.aboutMe,
            location: entry.currentLocation,
            profileUrl: entry.profileUrl || `https://gravatar.com/${entry.preferredUsername || md5Hash}`,
            extra: {
              hashMd5: md5Hash,
              hashSha256: sha256Hash,
              verifiedAccounts: entry.verifiedAccounts || [],
              urls: entry.urls || []
            }
          }
        };
      }

      if (res.status === 404) {
        // 2. Se a API de perfil retornou 404, checa se há pelo menos um avatar configurado (sem perfil público)
        const avatarCheckUrl = `https://www.gravatar.com/avatar/${md5Hash}?d=404`;
        const avatarRes = await fetch(avatarCheckUrl, {
          method: 'HEAD',
          headers,
          signal
        });

        if (avatarRes.status === 200) {
          return {
            exists: true,
            metadata: {
              avatarUrl: `https://www.gravatar.com/avatar/${sha256Hash}?s=400`,
              profileUrl: `https://gravatar.com/${md5Hash}`,
              extra: {
                hashMd5: md5Hash,
                hashSha256: sha256Hash,
                hasCustomAvatar: true
              }
            }
          };
        }

        return { exists: false };
      }

      if (res.status === 429) {
        return { exists: false, rateLimited: true, error: 'Rate limit excedido no Gravatar' };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};

