/**
 * @fileoverview Validador e normalizador de endereços de e-mail.
 * Inclui detecção rápida de domínios temporários/descartáveis mais comuns.
 */

// Regex RFC 5322 simplificada para formato de e-mail
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Lista de domínios descartáveis comuns em investigações
const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'sharklasers.com',
  'mailinator.com',
  'yopmail.com',
  'throwawaymail.com',
  'dispostable.com',
  'getairmail.com',
  'fakeinbox.com',
  'trashmail.com',
  'mohmal.com',
  'crazymailing.com',
  'burnermail.io'
]);

/**
 * Normaliza um e-mail para letras minúsculas e remove espaços das extremidades.
 * @param {string} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Valida a sintaxe do e-mail.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized || normalized.length > 254) return false;
  return EMAIL_REGEX.test(normalized);
}

/**
 * Extrai o domínio de um e-mail.
 * @param {string} email
 * @returns {string}
 */
export function getEmailDomain(email) {
  const parts = normalizeEmail(email).split('@');
  return parts.length === 2 ? parts[1] : '';
}

/**
 * Extrai o username/local part de um e-mail.
 * @param {string} email
 * @returns {string}
 */
export function getEmailUsername(email) {
  const parts = normalizeEmail(email).split('@');
  return parts.length === 2 ? parts[0] : '';
}

/**
 * Gera variações heurísticas comuns de um username para testes de perfil OSINT
 * (remove pontos, remove números finais, substitui separadores).
 * @param {string} username
 * @returns {string[]}
 */
export function getUsernameVariations(username) {
  if (!username || typeof username !== 'string') return [];
  const clean = username.trim().toLowerCase();
  if (!clean) return [];

  const variations = new Set([clean]);

  // 1. Sem separadores (pontos, hífens, underscores): "carlos.mazini" -> "carlosmazini"
  const withoutSep = clean.replace(/[._-]/g, '');
  if (withoutSep && withoutSep !== clean && withoutSep.length >= 3) {
    variations.add(withoutSep);
  }

  // 2. Substituindo underscores ou hífens por pontos: "carlos_mazini" -> "carlos.mazini"
  if (clean.includes('_') || clean.includes('-')) {
    const withDots = clean.replace(/[-_]/g, '.');
    if (withDots && withDots !== clean) {
      variations.add(withDots);
    }
  }

  // 3. Removendo números ao final: "cmazini99" -> "cmazini" ou "carlos.mazini123" -> "carlos.mazini"
  const withoutNumbers = clean.replace(/\d+$/, '');
  if (withoutNumbers && withoutNumbers !== clean && withoutNumbers.length >= 3) {
    variations.add(withoutNumbers);
    const noNumNoSep = withoutNumbers.replace(/[._-]/g, '');
    if (noNumNoSep && noNumNoSep !== withoutNumbers && noNumNoSep.length >= 3) {
      variations.add(noNumNoSep);
    }
  }

  return Array.from(variations);
}

/**
 * Verifica se o e-mail pertence a um provedor descartável/temporário conhecido.
 * @param {string} email
 * @returns {boolean}
 */
export function isDisposableEmail(email) {
  const domain = getEmailDomain(email);
  return DISPOSABLE_DOMAINS.has(domain);
}

