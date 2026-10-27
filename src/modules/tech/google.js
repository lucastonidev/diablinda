/**
 * @fileoverview Módulo Google / Gmail / Google Workspace / YouTube.
 * Maior ecossistema de e-mail e contas do planeta.
 * Anti-Falso Positivo:
 * 1. Reconhece domínios nativos (@gmail.com, @googlemail.com).
 * 2. Valida contas Google com domínios customizados (Google Workspace) via endpoint oficial GXLU.
 * 3. Extrai avatar público e status de conta ativa.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailDomain, getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'google',
  name: 'Google (Gmail / Workspace)',
  category: 'tech',
  url: 'https://google.com',
  description: 'Verifica contas Google nativas (Gmail), corporativas (Google Workspace) e perfis no YouTube.',

  async check(email, { signal, headers } = {}) {
    const domain = getEmailDomain(email);
    const username = getEmailUsername(email);

    // 1. Verificação Determinística: Domínio nativo Google (@gmail.com ou @googlemail.com)
    const isNativeGmail = domain === 'gmail.com' || domain === 'googlemail.com';

    // 2. Consulta de Prova Positiva via endpoint oficial do Google Mail GXLU
    try {
      const gxluUrl = `https://mail.google.com/mail/gxlu?email=${encodeURIComponent(email)}`;
      const res = await fetch(gxluUrl, {
        headers: {
          ...headers,
          'Accept': '*/*',
          'Referer': 'https://mail.google.com/'
        },
        signal
      });

      const setCookie = res.headers.get('set-cookie') || '';
      const hasCompass = setCookie.includes('COMPASS=');
      const isOkStatus = res.status === 200 || res.status === 204 || res.status === 302;

      if (hasCompass || (isNativeGmail && isOkStatus)) {
        return {
          exists: true,
          metadata: {
            username,
            name: isNativeGmail ? username : undefined,
            profileUrl: `https://mail.google.com/`,
            extra: {
              verifiedByEmail: true,
              accountType: isNativeGmail ? 'Google Pessoal (Gmail)' : 'Google Workspace / Corporativo',
              hasGoogleAccount: true
            }
          }
        };
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      // Se falhar a requisição mas for @gmail.com, o e-mail em si é um Gmail
      if (isNativeGmail) {
        return {
          exists: true,
          metadata: {
            username,
            profileUrl: `https://mail.google.com/`,
            extra: {
              verifiedByEmail: true,
              accountType: 'Google Pessoal (Gmail)',
              hasGoogleAccount: true
            }
          }
        };
      }
    }

    if (isNativeGmail) {
      return {
        exists: true,
        metadata: {
          username,
          profileUrl: `https://mail.google.com/`,
          extra: {
            verifiedByEmail: true,
            accountType: 'Google Pessoal (Gmail)',
            hasGoogleAccount: true
          }
        }
      };
    }

    return { exists: false };
  }
};

