/**
 * @fileoverview Módulo ProtonMail.
 * Consulta o servidor público de chaves PGP da Proton para verificar se o e-mail possui
 * par de chaves ativas e conta registrada na infraestrutura Proton.
 * Anti-Falso Positivo: Valida a assinatura de bloco PGP público e status 200.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'protonmail',
  name: 'ProtonMail',
  category: 'tech',
  url: 'https://proton.me',
  description: 'Verifica existência de conta e chave PGP pública na infraestrutura Proton.',

  async check(email, { signal, headers } = {}) {
    const url = `https://api.protonmail.ch/pks/lookup?op=get&search=${encodeURIComponent(email)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'text/plain, application/pgp-keys'
        },
        signal
      });

      const bodyText = await res.text();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit ou bloqueio no ProtonMail' };
      }

      // Validação estrita: somente marca como existente se o bloco PGP real estiver presente
      if (res.status === 200 && bodyText.includes('-----BEGIN PGP PUBLIC KEY BLOCK-----')) {
        return {
          exists: true,
          metadata: {
            profileUrl: `https://mail.proton.me`,
            extra: {
              hasPgpKey: true,
              keyBlockPreview: bodyText.slice(0, 150)
            }
          }
        };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};

