/**
 * @fileoverview Formatador de resultados de varredura (Terminal, JSON, CSV).
 */

import { c, formatBadge } from './theme.js';

/**
 * Formata um item individual durante a execução em tempo real no terminal.
 * @param {import('../core/types.js').ServiceResult} res
 * @param {number} current
 * @param {number} total
 * @returns {string}
 */
export function formatProgressItem(res, current, total) {
  const padDigits = String(total).length;
  const indexStr = `${c.dim}[${String(current).padStart(padDigits, ' ')}/${total}]${c.reset}`;
  const serviceStr = `${c.bold}${res.service.padEnd(20)}${c.reset}`;
  const catStr = `${c.cyan}[${res.category.padEnd(13)}]${c.reset}`;
  const durStr = `${c.dim}(${res.durationMs}ms)${c.reset}`;

  if (res.exists) {
    let out = `${indexStr} ${c.brightGreen}${c.bold}[+]${c.reset} ${serviceStr} ${catStr} ${formatBadge('HIT')} ${durStr}`;
    if (res.metadata && Object.keys(res.metadata).length > 0) {
      const meta = res.metadata;
      const details = [];

      if (meta.name) details.push(`${c.bold}Nome:${c.reset} ${meta.name}`);
      if (meta.username) details.push(`${c.bold}@username:${c.reset} @${meta.username}`);
      if (meta.avatarUrl) details.push(`${c.bold}Avatar:${c.reset} ${c.underline}${meta.avatarUrl}${c.reset}`);
      if (meta.profileUrl) details.push(`${c.bold}Perfil:${c.reset} ${c.underline}${meta.profileUrl}${c.reset}`);
      if (meta.location) details.push(`${c.bold}Localização:${c.reset} ${meta.location}`);
      if (meta.company) details.push(`${c.bold}Empresa:${c.reset} ${meta.company}`);
      if (meta.website) details.push(`${c.bold}Website:${c.reset} ${c.underline}${meta.website}${c.reset}`);
      if (meta.bio) details.push(`${c.bold}Bio:${c.reset} "${meta.bio.slice(0, 80)}"`);

      if (meta.extra) {
        if (meta.extra.verifiedByEmail) details.push(`${c.brightGreen}🔒 Confirmado por E-mail${c.reset}`);
        if (meta.extra.maskedPhone) details.push(`${c.brightYellow}📱 Telefone vinculado: ${meta.extra.maskedPhone}${c.reset}`);
        if (meta.extra.maskedEmail) details.push(`${c.brightCyan}✉️ E-mail de recuperação: ${meta.extra.maskedEmail}${c.reset}`);
        if (meta.extra.streak) details.push(`${c.brightYellow}🔥 Streak: ${meta.extra.streak} dias${c.reset}`);
        if (meta.extra.totalXp) details.push(`${c.brightCyan}⭐ XP: ${meta.extra.totalXp}${c.reset}`);
        if (meta.extra.rating) details.push(`${c.brightMagenta}♟️ Rating: ${meta.extra.rating}${c.reset}`);
        if (meta.extra.microsoftAccountType) details.push(`${c.brightBlue}🏢 Tipo: ${meta.extra.microsoftAccountType}${c.reset}`);
        if (meta.extra.followers !== undefined) details.push(`${c.dim}Seguidores: ${meta.extra.followers}${c.reset}`);
        if (meta.extra.courses?.length) {
          const langNames = meta.extra.courses.map((c) => c.title || c.learningLanguage).filter(Boolean).slice(0, 3).join(', ');
          details.push(`${c.dim}Idiomas: [${langNames}]${c.reset}`);
        }
      }

      if (details.length > 0) {
        out += `\n    ${c.dim}└─>${c.reset} ` + details.join(`\n    ${c.dim}└─>${c.reset} `);
      }
    }
    return out;
  }

  if (res.rateLimited) {
    return `${indexStr} ${c.brightYellow}[!]${c.reset} ${serviceStr} ${catStr} ${formatBadge('RATE_LIMIT')} ${durStr}`;
  }

  if (res.error) {
    return `${indexStr} ${c.brightRed}[x]${c.reset} ${serviceStr} ${catStr} ${c.dim}${res.error.slice(0, 30)}${c.reset} ${durStr}`;
  }

  return `${indexStr} ${c.dim}[-] ${serviceStr} ${catStr} Não encontrado ${durStr}${c.reset}`;
}

/**
 * Formata um único hit no terminal com detalhes e metadados.
 * @param {import('../core/types.js').ServiceResult} res
 * @returns {string}
 */
export function formatHitLine(res) {
  const parts = [];
  parts.push(`${c.brightGreen}${c.bold}[+]${c.reset} ${c.brightWhite}${c.bold}${res.service.padEnd(20)}${c.reset}`);
  parts.push(`${c.cyan}[${res.category}]${c.reset}`);
  parts.push(formatBadge('HIT'));
  parts.push(`${c.dim}(${res.durationMs}ms)${c.reset}`);

  let out = parts.join(' ');

  if (res.metadata && Object.keys(res.metadata).length > 0) {
    const meta = res.metadata;
    const details = [];

    if (meta.name) details.push(`${c.bold}Nome:${c.reset} ${meta.name}`);
    if (meta.username) details.push(`${c.bold}@username:${c.reset} @${meta.username}`);
    if (meta.avatarUrl) details.push(`${c.bold}Avatar:${c.reset} ${c.underline}${meta.avatarUrl}${c.reset}`);
    if (meta.profileUrl) details.push(`${c.bold}Perfil:${c.reset} ${c.underline}${meta.profileUrl}${c.reset}`);
    if (meta.location) details.push(`${c.bold}Localização:${c.reset} ${meta.location}`);
    if (meta.company) details.push(`${c.bold}Empresa:${c.reset} ${meta.company}`);
    if (meta.website) details.push(`${c.bold}Website:${c.reset} ${c.underline}${meta.website}${c.reset}`);
    if (meta.bio) details.push(`${c.bold}Bio:${c.reset} "${meta.bio.slice(0, 80)}"`);

    if (meta.extra) {
      if (meta.extra.verifiedByEmail) details.push(`${c.brightGreen}🔒 Confirmado por E-mail${c.reset}`);
      if (meta.extra.maskedPhone) details.push(`${c.brightYellow}📱 Telefone vinculado: ${meta.extra.maskedPhone}${c.reset}`);
      if (meta.extra.maskedEmail) details.push(`${c.brightCyan}✉️ E-mail de recuperação: ${meta.extra.maskedEmail}${c.reset}`);
      if (meta.extra.streak) details.push(`${c.brightYellow}🔥 Streak: ${meta.extra.streak} dias${c.reset}`);
      if (meta.extra.totalXp) details.push(`${c.brightCyan}⭐ XP: ${meta.extra.totalXp}${c.reset}`);
      if (meta.extra.rating) details.push(`${c.brightMagenta}♟️ Rating: ${meta.extra.rating}${c.reset}`);
      if (meta.extra.microsoftAccountType) details.push(`${c.brightBlue}🏢 Tipo: ${meta.extra.microsoftAccountType}${c.reset}`);
      if (meta.extra.followers !== undefined) details.push(`${c.dim}Seguidores: ${meta.extra.followers}${c.reset}`);
      if (meta.extra.courses?.length) {
        const langNames = meta.extra.courses.map((c) => c.title || c.learningLanguage).filter(Boolean).slice(0, 3).join(', ');
        details.push(`${c.dim}Idiomas: [${langNames}]${c.reset}`);
      }
    }

    if (details.length > 0) {
      out += `\n    ${c.dim}└─>${c.reset} ` + details.join(`\n    ${c.dim}└─>${c.reset} `);
    }
  }

  return out;
}

/**
 * Formata um sumário final no terminal.
 * @param {import('../core/types.js').ScanSummary} summary
 * @param {import('../core/dossier.js').TargetDossier} [dossier]
 * @returns {string}
 */
export function formatSummary(summary, dossier) {
  const line = `${c.dim}${'─'.repeat(70)}${c.reset}`;
  let out = '';

  if (dossier && (dossier.names.length > 0 || dossier.usernames.length > 0 || dossier.avatars.length > 0 || dossier.externalLinks.length > 0)) {
    out += `
${line}
${c.bold}  🕵️ IDENTIDADE CONSOLIDADA DO ALVO (DOSSIÊ)${c.reset}
${line}
`;
    if (dossier.names.length > 0) {
      out += `  ${c.bold}Nome(s) Detectado(s):${c.reset} ${c.brightGreen}${c.bold}${dossier.names.join(' | ')}${c.reset}\n`;
    }
    if (dossier.usernames.length > 0) {
      out += `  ${c.bold}@Usernames:${c.reset}           ${c.brightCyan}${dossier.usernames.map((u) => '@' + u).join(', ')}${c.reset}\n`;
    }
    if (dossier.locations.length > 0) {
      out += `  ${c.bold}Localização:${c.reset}         ${dossier.locations.join(' | ')}\n`;
    }
    if (dossier.companies && dossier.companies.length > 0) {
      out += `  ${c.bold}Empresa(s):${c.reset}          ${dossier.companies.join(', ')}\n`;
    }
    if (dossier.maskedPhones && dossier.maskedPhones.length > 0) {
      out += `  ${c.bold}Telefone(s):${c.reset}         ${c.brightYellow}${dossier.maskedPhones.join(', ')}${c.reset}\n`;
    }
    if (dossier.maskedEmails && dossier.maskedEmails.length > 0) {
      out += `  ${c.bold}Recuperação:${c.reset}         ${c.brightCyan}${dossier.maskedEmails.join(', ')}${c.reset}\n`;
    }
    if (dossier.avatars.length > 0) {
      out += `  ${c.bold}Avatar HD:${c.reset}           ${c.underline}${dossier.avatars[0]}${c.reset}\n`;
    }
    if (dossier.bios.length > 0) {
      out += `  ${c.bold}Bio Pública:${c.reset}         "${dossier.bios[0].slice(0, 100)}"\n`;
    }
    if (dossier.externalLinks.length > 0) {
      out += `  ${c.bold}Links Confirmados:${c.reset}   ${dossier.externalLinks.map((l) => `${l.platform} (${l.url})`).join(', ')}\n`;
    }
    out += `  ${c.bold}Grau de Certeza:${c.reset}     ${dossier.verifiedByEmail.length > 0 ? `${c.brightGreen}${dossier.verifiedByEmail.length} contas confirmadas por E-mail${c.reset}` : `${c.brightYellow}Verificado via Handle/Username${c.reset}`}\n`;
  }

  out += `
${line}
${c.bold}  📊 RELATÓRIO FINAL DA INVESTIGAÇÃO${c.reset}
${line}
  ${c.bold}Alvo:${c.reset}               ${c.brightCyan}${summary.email}${c.reset}
  ${c.bold}Total de Serviços:${c.reset}  ${summary.totalModules}
  ${c.bold}Contas Encontradas:${c.reset} ${c.brightGreen}${c.bold}${summary.hits}${c.reset}
  ${c.bold}Não Encontradas:${c.reset}    ${c.dim}${summary.misses}${c.reset}
  ${c.bold}Erros / Limites:${c.reset}    ${summary.errors > 0 ? `${c.brightYellow}${summary.errors}` : `${c.dim}0`}${c.reset}
  ${c.bold}Tempo Total:${c.reset}        ${(summary.totalDurationMs / 1000).toFixed(2)}s
${line}
`;
  return out;
}

/**
 * Converte os resultados para CSV.
 * @param {import('../core/types.js').ScanSummary} summary
 * @returns {string}
 */
export function formatCSV(summary) {
  const headers = ['service', 'category', 'exists', 'username', 'name', 'profileUrl', 'avatarUrl', 'durationMs', 'error'];
  const rows = [headers.join(',')];

  for (const r of summary.results) {
    const meta = r.metadata || {};
    const values = [
      `"${r.service}"`,
      `"${r.category}"`,
      r.exists ? 'true' : 'false',
      `"${(meta.username || '').replace(/"/g, '""')}"`,
      `"${(meta.name || '').replace(/"/g, '""')}"`,
      `"${(meta.profileUrl || '').replace(/"/g, '""')}"`,
      `"${(meta.avatarUrl || '').replace(/"/g, '""')}"`,
      r.durationMs,
      `"${(r.error || '').replace(/"/g, '""')}"`
    ];
    rows.push(values.join(','));
  }

  return rows.join('\n');
}
