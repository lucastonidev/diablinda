/**
 * @fileoverview Módulo Facebook (Meta).
 * Maior rede social do mundo.
 * Anti-Falso Positivo:
 * 1. Consulta tentativa de registro/recuperação Meta.
 * 2. Valida perfil público descartando telas de "Conteúdo indisponível" e soft-404.
 * 3. Extrai nome real de exibição, foto de perfil HD (OpenGraph) e biografia.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername, getUsernameVariations } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'facebook',
  name: 'Facebook',
  category: 'social',
  url: 'https://facebook.com',
  description: 'Verifica contas e perfis públicos no Facebook (Meta) com suporte a variações de handle.',

  async check(email, { signal, headers } = {}) {
    const username = getEmailUsername(email);

    // 1. Verificação DIRETA via Meta Web Create Ajax (se token disponível)
    try {
      const initialRes = await fetch('https://www.facebook.com/', {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://www.facebook.com/'
        },
        signal
      });

      if (initialRes.status === 200) {
        const initialHtml = await initialRes.text();
        const lsdMatch = initialHtml.match(/name="lsd"\s+value="([^"]+)"/i) || initialHtml.match(/"LSD",\[\],{"token":"([^"]+)"}/i);
        const lsd = lsdMatch ? lsdMatch[1] : null;

        if (lsd) {
          const attemptUrl = 'https://www.facebook.com/ajax/register.php';
          const params = new URLSearchParams({
            lsd,
            reg_email__: email,
            action: 'check_email'
          });

          const regRes = await fetch(attemptUrl, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': '*/*',
              'Origin': 'https://www.facebook.com',
              'Referer': 'https://www.facebook.com/'
            },
            body: params.toString(),
            signal
          });

          if (regRes.status === 200) {
            const regText = await regRes.text();
            if (regText.includes('email_taken') || regText.includes('already_registered') || regText.includes('contact_importer')) {
              return {
                exists: true,
                metadata: {
                  profileUrl: 'https://www.facebook.com',
                  extra: {
                    verifiedByEmail: true,
                    facebookAccount: true
                  }
                }
              };
            }
          }
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback por variações heurísticas de perfil público (com/sem ponto, com/sem número)
    if (!username) return { exists: false };

    const candidates = getUsernameVariations(username);
    const discoveredCandidates = [];

    for (const cand of candidates) {
      const profileUrl = `https://www.facebook.com/${encodeURIComponent(cand)}`;

      try {
        const res = await fetch(profileUrl, {
          headers: {
            ...headers,
            'Accept': 'text/html,application/xhtml+xml',
            'Referer': 'https://www.facebook.com/'
          },
          signal
        });

        const bodyText = await res.text();

        if (res.status === 200) {
          if (isHtmlProfileNotFound(bodyText, cand)) {
            continue;
          }

          const isUnavailable = bodyText.includes("This content isn't available right now") ||
                                bodyText.includes('Este conteúdo não está disponível no momento') ||
                                bodyText.includes('Esta página não está disponível') ||
                                bodyText.includes('Page Not Found') ||
                                bodyText.includes('Entrar no Facebook');

          const titleMatch = bodyText.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1] : '';

          const ogTitleMatch = bodyText.match(/property="og:title"\s+content="([^"]+)"/i) || bodyText.match(/content="([^"]+)"\s+property="og:title"/i);
          const ogImageMatch = bodyText.match(/property="og:image"\s+content="([^"]+)"/i) || bodyText.match(/content="([^"]+)"\s+property="og:image"/i);
          const ogDescMatch = bodyText.match(/property="og:description"\s+content="([^"]+)"/i) || bodyText.match(/content="([^"]+)"\s+property="og:description"/i);

          const hasValidOg = ogTitleMatch && !ogTitleMatch[1].toLowerCase().includes('facebook') && !ogTitleMatch[1].includes('404');
          const hasValidTitle = title && !title.includes('404') && !title.includes('Log in') && !title.includes('Entrar');

          if (!isUnavailable && (hasValidOg || hasValidTitle)) {
            const rawName = ogTitleMatch ? ogTitleMatch[1] : title.split('|')[0].trim();
            const avatarUrl = ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, '&') : undefined;
            const bio = ogDescMatch ? ogDescMatch[1].trim() : undefined;

            discoveredCandidates.push({
              username: cand,
              name: rawName,
              avatarUrl,
              bio,
              profileUrl
            });
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        // segue para próxima variação
      }
    }

    if (discoveredCandidates.length > 0) {
      // Prioriza a variação exata original se existir, ou o primeiro candidato
      const primary = discoveredCandidates.find((c) => c.username === username.toLowerCase()) || discoveredCandidates[0];

      return {
        exists: true,
        metadata: {
          username: primary.username,
          name: primary.name,
          avatarUrl: primary.avatarUrl,
          bio: primary.bio,
          profileUrl: primary.profileUrl,
          extra: {
            platform: 'Facebook',
            heuristicHandle: true,
            verifiedByEmail: false,
            matchedVariation: primary.username,
            testedVariations: candidates,
            candidateProfiles: discoveredCandidates.map((c) => ({
              handle: c.username,
              name: c.name,
              url: c.profileUrl
            }))
          }
        }
      };
    }

    return { exists: false };
  }
};

