/**
 * @fileoverview Validador anti-falso-positivo para páginas de perfil em HTML (SPAs).
 * Evita o clássico problema de "Soft 404" (onde o servidor retorna HTTP 200 para páginas não encontradas).
 */

const NOT_FOUND_TITLE_PATTERNS = [
  /profile not found/i,
  /user not found/i,
  /page not found/i,
  /perfil n[aã]o encontrado/i,
  /p[aá]gina n[aã]o encontrada/i,
  /404/i,
  /could not be found/i,
  /doesn['’]t exist/i,
  /nicht gefunden/i,
  /introuvable/i
];

const NOT_FOUND_BODY_PATTERNS = [
  /this profile could not be found/i,
  /this profile is not available/i,
  /this user could not be found/i,
  /this account does not exist/i,
  /this account doesn['’]t exist/i,
  /couldn['’]t find that/i,
  /sorry, this page isn['’]t available/i,
  /the link you followed may be broken/i,
  /user does not exist/i,
  /user not found/i,
  /no user found/i,
  /we couldn['’]t find the page/i,
  /looking for someone\?/i,
  /the page you were looking for doesn['’]t exist/i
];

/**
 * Analisa o HTML retornado e determina se a página é um "Soft 404" (página de perfil inexistente).
 * @param {string} html - Conteúdo HTML da página
 * @param {string} [username=''] - Nome de usuário pesquisado
 * @returns {boolean} Retorna TRUE se for comprovadamente uma página 404/Não Encontrada
 */
export function isHtmlProfileNotFound(html, username = '') {
  if (typeof html !== 'string' || !html.trim()) {
    return true;
  }

  // 1. Extrai a tag <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Se o título contiver padrões clássicos de 404
  for (const pattern of NOT_FOUND_TITLE_PATTERNS) {
    if (pattern.test(title)) {
      return true;
    }
  }

  // 2. Analisa o corpo da página em busca de mensagens de ausência de perfil
  for (const pattern of NOT_FOUND_BODY_PATTERNS) {
    if (pattern.test(html)) {
      return true;
    }
  }

  return false;
}

/**
 * Valida se há evidências positivas reais de que o perfil existe.
 * @param {string} html
 * @param {string} username
 * @returns {boolean}
 */
export function hasPositiveProfileProof(html, username) {
  if (isHtmlProfileNotFound(html, username)) {
    return false;
  }

  const lower = html.toLowerCase();
  const u = (username || '').toLowerCase();

  // Verifica se o username aparece no título ou em metatags de perfil reais
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].toLowerCase() : '';

  const isProfileInTitle = title.includes(u) && !NOT_FOUND_TITLE_PATTERNS.some((p) => p.test(title));
  const hasOgProfile = lower.includes('property="og:type" content="profile"') || lower.includes('content="profile" property="og:type"');
  const hasUserSchema = lower.includes('"@type":"person"') || lower.includes('"@type": "person"');

  return isProfileInTitle || hasOgProfile || hasUserSchema;
}

