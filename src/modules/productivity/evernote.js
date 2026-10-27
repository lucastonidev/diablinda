/**
 * @fileoverview Módulo Evernote.
 * Aplicativo pioneiro de organização pessoal, notas e produtividade.
 * Anti-Falso Positivo: Valida retorno booleano `false` (indisponível) no endpoint de checagem.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'evernote',
  name: 'Evernote',
  category: 'productivity',
  url: 'https://evernote.com',
  description: 'Verifica existência de conta no Evernote.',

  async check(email, { signal, headers } = {}) {
    const url = `https://www.evernote.com/Registration.action?checkEmail=&email=${encodeURIComponent(email)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'application/json, text/plain, */*'
        },
        signal
      });

      const bodyText = (await res.text()).trim();

      if (isWafOrBlocked(res, bodyText)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Evernote' };
      }

      if (res.status === 200) {
        // Se retornar false, o email NÃO está disponível para registro (conta já existe)
        if (bodyText === 'false' || bodyText.includes('"isAvailable":false') || bodyText.includes('"available":false')) {
          return {
            exists: true,
            metadata: {
              profileUrl: 'https://www.evernote.com',
              extra: { evernoteAccount: true }
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

