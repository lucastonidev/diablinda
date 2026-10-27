/**
 * @fileoverview Módulo Jusbrasil.
 * Maior portal jurídico do Brasil. Investiga menções públicas ou existência de conta.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';

export default {
  id: 'jusbrasil',
  name: 'Jusbrasil',
  category: 'brasil',
  url: 'https://www.jusbrasil.com.br',
  description: 'Pesquisa citações públicas, publicações e perfis jurídicos no Jusbrasil.',

  async check(email, { signal, headers } = {}) {
    const username = getEmailUsername(email);
    const searchUrl = `https://www.jusbrasil.com.br/artigos-noticias/busca?q=${encodeURIComponent(username)}`;

    try {
      const res = await fetch(searchUrl, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal
      });

      if (res.status === 429) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Jusbrasil' };
      }

      if (res.status === 200) {
        const html = await res.text();
        const hasResults = !html.includes('Nenhum resultado encontrado') && (html.includes('artigo') || html.includes('notícia') || html.includes('processo'));

        if (hasResults) {
          return {
            exists: true,
            metadata: {
              profileUrl: searchUrl,
              extra: {
                query: username,
                platform: 'Jusbrasil Busca Pública'
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

