/**
 * @fileoverview Módulo Apple ID / iCloud.
 * Maior ecossistema de dispositivos e serviços Apple (iOS, macOS, iCloud, App Store).
 * Anti-Falso Positivo: Verifica endpoint de descoberta e autenticação da Apple (IDMSA).
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'apple',
  name: 'Apple ID (iCloud)',
  category: 'tech',
  url: 'https://apple.com',
  description: 'Verifica contas Apple ID, dispositivos iOS/macOS e armazenamento iCloud.',

  async check(email, { signal, headers } = {}) {
    const username = getEmailUsername(email);
    const domain = email.split('@')[1]?.toLowerCase();
    const isNativeApple = domain === 'icloud.com' || domain === 'me.com' || domain === 'mac.com';

    // 1. Verificação Determinística: Domínios nativos Apple (@icloud.com, @me.com, @mac.com)
    if (isNativeApple) {
      return {
        exists: true,
        metadata: {
          username,
          profileUrl: 'https://appleid.apple.com',
          extra: {
            verifiedByEmail: true,
            nativeAppleDomain: true
          }
        }
      };
    }

    const authUrl = 'https://idmsa.apple.com/appleauth/auth/federate';

    try {
      const res = await fetch(authUrl, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://appleid.apple.com',
          'Referer': 'https://appleid.apple.com/'
        },
        body: JSON.stringify({
          accountName: email
        }),
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit na Apple' };
      }

      if (res.status === 200 || res.status === 409) {
        try {
          const json = JSON.parse(bodyText);
          // Se retornar status federado ou indicador de autenticação com sucesso
          if (json?.isFederated !== undefined || json?.status === 'success' || json?.authType) {
            return {
              exists: true,
              metadata: {
                username,
                profileUrl: 'https://appleid.apple.com',
                extra: {
                  verifiedByEmail: true,
                  appleId: true,
                  isFederated: json?.isFederated || false
                }
              }
            };
          }
        } catch {
          // segue
        }
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
