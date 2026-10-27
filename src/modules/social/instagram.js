/**
 * @fileoverview Módulo Instagram.
 * Realiza verificação DIRETA de e-mail através da API de validação de cadastro do Instagram
 * e verificação de perfil público.
 * Anti-Falso Positivo: Valida especificamente o código `email_is_taken` retornado pela Meta.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'instagram',
  name: 'Instagram',
  category: 'social',
  url: 'https://instagram.com',
  description: 'Verifica se o endereço de e-mail possui conta registrada no Instagram.',

  async check(email, { signal, headers } = {}) {
    // 1. Tenta verificação DIRETA por e-mail via API de cadastro web da Meta
    try {
      const signupUrl = 'https://www.instagram.com/api/v1/web/accounts/web_create_ajax/attempt/';
      const bodyParams = new URLSearchParams({
        email: email,
        username: '',
        first_name: '',
        opt_into_one_tap: 'false'
      });

      const res = await fetch(signupUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '*/*',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'https://www.instagram.com',
          'Referer': 'https://www.instagram.com/accounts/emailsignup/'
        },
        body: bodyParams.toString(),
        signal
      });

      const bodyText = await res.text();

      if (res.status === 200 || res.status === 400) {
        try {
          const data = JSON.parse(bodyText);
          const emailErrors = data?.errors?.email;
          const isTaken = Array.isArray(emailErrors) && emailErrors.some((e) =>
            e.code === 'email_is_taken' ||
            e.code === 'email_sharing_limit' ||
            e.message?.toLowerCase()?.includes('another account is using')
          );

          if (isTaken) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://www.instagram.com',
                extra: {
                  verifiedByEmail: true,
                  instagramAccount: true
                }
              }
            };
          }

          // Se a API informou que o e-mail é válido/disponível (sem erro de email_is_taken)
          if (data?.status === 'ok' || (data?.errors && !data.errors.email)) {
            return { exists: false };
          }
        } catch {
          // segue para fallback
        }
      }
    } catch {
      // segue para fallback de perfil
    }

    // 2. Fallback por handle caso a API da Meta solicite challenge
    const username = getEmailUsername(email);
    if (!username) return { exists: false };

    try {
      const url = `https://www.instagram.com/${encodeURIComponent(username)}/`;
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-Mode': 'navigate'
        },
        signal
      });

      const bodyText = await res.text();

      if (res.url.includes('/accounts/login') || isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Instagram solicitou login/challenge' };
      }

      if (res.status === 200) {
        if (isHtmlProfileNotFound(bodyText, username)) {
          return { exists: false };
        }

        const titleMatch = bodyText.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';

        if (!title.includes('Page not found') && (bodyText.includes(`"username":"${username}"`) || title.includes(username))) {
          const avatarMatch = bodyText.match(/meta property="og:image" content="([^"]+)"/i);
          return {
            exists: true,
            metadata: {
              username,
              name: title.split('(')[0].trim(),
              avatarUrl: avatarMatch ? avatarMatch[1] : undefined,
              profileUrl: url,
              extra: { platform: 'Instagram' }
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
