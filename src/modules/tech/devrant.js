/**
 * @fileoverview Módulo devRant.
 * Rede social e comunidade de desenvolvedores para desabafos e código.
 * Anti-Falso Positivo: Realiza verificação de recuperação de senha por e-mail e validação de perfil via API oficial.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'devrant',
  name: 'devRant',
  category: 'tech',
  url: 'https://devrant.com',
  description: 'Verifica perfis e rants de desenvolvedores na comunidade devRant.',

  async check(email, { signal, headers } = {}) {
    // 1. Verificação DIRETA por e-mail no endpoint de reset do devRant
    try {
      const resetUrl = 'https://devrant.com/api/users/reset-password?app=3';
      const body = new URLSearchParams({ email });
      const resReset = await fetch(resetUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: body.toString(),
        signal
      });

      if (resReset.status === 200) {
        const textReset = await resReset.text();
        try {
          const json = JSON.parse(textReset);
          if (json?.success === true) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://devrant.com',
                extra: {
                  verifiedByEmail: true,
                  devrantAccount: true
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

    // 2. Fallback por perfil de desenvolvedor
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    const url = `https://devrant.com/api/users/${encodeURIComponent(username)}?app=3`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'application/json'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no devRant' };
      }

      if (res.status === 200) {
        try {
          const data = JSON.parse(bodyText);
          const profile = data?.profile;
          if (data?.success && profile && profile.username) {
            return {
              exists: true,
              metadata: {
                username: profile.username,
                bio: profile.about,
                profileUrl: `https://devrant.com/users/${profile.username}`,
                extra: {
                  score: profile.score,
                  rantsCount: profile.content?.counts?.rants
                }
              }
            };
          }
        } catch {
          return { exists: false };
        }
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};

