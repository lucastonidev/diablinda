/**
 * @fileoverview Módulo Discord.
 * Verifica a existência de conta registrada na plataforma Discord.
 * Anti-Falso Positivo: Valida especificamente o código de erro `EMAIL_ALREADY_REGISTERED`.
 * Captchas ou Cloudflare são tratados como bloqueio, nunca como conta encontrada.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'discord',
  name: 'Discord',
  category: 'social',
  url: 'https://discord.com',
  description: 'Verifica existência de conta registrada na rede Discord.',

  async check(email, { signal, headers } = {}) {
    const url = 'https://discord.com/api/v9/auth/register';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          consent: true
        }),
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText) || bodyText.includes('captcha_key')) {
        return { exists: false, rateLimited: true, error: 'Discord exigiu Captcha/Rate Limit' };
      }

      if (res.status === 400) {
        try {
          const data = JSON.parse(bodyText);
          const errors = data?.email?._errors;
          if (Array.isArray(errors) && errors.some((e) => e.code === 'EMAIL_ALREADY_REGISTERED' || e.message?.includes('already registered'))) {
            return {
              exists: true,
              metadata: {
                profileUrl: 'https://discord.com',
                extra: { discordAccount: true }
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

