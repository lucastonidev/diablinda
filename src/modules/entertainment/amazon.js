/**
 * @fileoverview Módulo Amazon.
 * Maior plataforma de e-commerce e serviços digitais (Prime, Kindle, AWS).
 * Anti-Falso Positivo: Verifica endpoint de autenticação e recuperação da Amazon.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'amazon',
  name: 'Amazon',
  category: 'entertainment',
  url: 'https://amazon.com',
  description: 'Verifica existência de conta de consumidor, Prime e serviços digitais na Amazon.',

  async check(email, { signal, headers } = {}) {
    const username = getEmailUsername(email);
    const signinUrl = 'https://www.amazon.com/ap/signin';

    try {
      // 1. Envia verificação de e-mail na tela de login da Amazon
      const params = new URLSearchParams({
        'openid.ns': 'http://specs.openid.net/auth/2.0',
        'openid.mode': 'checkid_setup',
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.assoc_handle': 'usflex',
        'email': email
      });

      const res = await fetch(`${signinUrl}?${params.toString()}`, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.amazon.com/'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit / Captcha na Amazon' };
      }

      if (res.status === 200) {
        const notFound = bodyText.includes('We cannot find an account with that email address') ||
                         bodyText.includes('Não encontramos uma conta com este endereço de e-mail') ||
                         bodyText.includes('No account found');

        const hasPasswordPrompt = bodyText.includes('ap_password') ||
                                  bodyText.includes('Enter your password') ||
                                  bodyText.includes('Digite sua senha') ||
                                  bodyText.includes('auth-password-missing-alert');

        if (hasPasswordPrompt && !notFound) {
          return {
            exists: true,
            metadata: {
              username,
              profileUrl: 'https://www.amazon.com',
              extra: {
                verifiedByEmail: true,
                amazonAccount: true
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

