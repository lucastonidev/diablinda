/**
 * @fileoverview Agregador e Construtor de Dossiê Investigativo (Unified Target Dossier).
 * Cruza dados de múltiplos módulos para compilar identidades, fotos HD, bios, localizações,
 * empresas, pistas de contato e calcular níveis de confiança (Verificado por E-mail vs Handle).
 */

/**
 * @typedef {Object} TargetDossier
 * @property {string} targetEmail - E-mail investigado
 * @property {string[]} names - Nomes reais e de exibição consolidados
 * @property {string[]} usernames - @handles públicos descobertos
 * @property {string[]} avatars - URLs de fotos de perfil em alta resolução
 * @property {string[]} locations - Localizações geográficas associadas
 * @property {string[]} bios - Biografias e descrições públicas
 * @property {string[]} companies - Empresas e organizações identificadas
 * @property {string[]} maskedPhones - Pistas de números de telefone mascarados
 * @property {string[]} maskedEmails - Pistas de e-mails de recuperação mascarados
 * @property {Array<{ platform: string, url: string }>} externalLinks - Links e contas verificadas
 * @property {Array<import('./types.js').ServiceResult>} verifiedByEmail - Contas com confirmação 100% direta por e-mail
 * @property {Array<import('./types.js').ServiceResult>} verifiedByHandle - Contas associadas por heurística de @handle
 */

/**
 * Constrói o dossiê unificado a partir dos resultados de uma varredura.
 * @param {string} email
 * @param {Array<import('./types.js').ServiceResult>} results
 * @returns {TargetDossier}
 */
export function buildTargetDossier(email, results) {
  const names = new Set();
  const usernames = new Set();
  const avatars = new Set();
  const locations = new Set();
  const bios = new Set();
  const companies = new Set();
  const maskedPhones = new Set();
  const maskedEmails = new Set();
  const externalLinks = [];

  const verifiedByEmail = [];
  const verifiedByHandle = [];

  const hits = results.filter((r) => r.exists);

  // Módulos com confirmação nativa e exclusiva de e-mail por design
  const directEmailModules = new Set([
    'google',
    'apple',
    'amazon',
    'office365',
    'gravatar',
    'github',
    'gitlab',
    'duolingo',
    'protonmail',
    'firefox',
    'spotify',
    'twitter',
    'strava',
    'wattpad',
    'freelancer',
    'deliveroo',
    'evernote',
    'bitmoji',
    'soundcloud',
    'replit',
    'samsung',
    'yahoo',
    'adobe',
    'vakinha',
    'apoiase',
    'pinterest',
    'discord',
    'tumblr'
  ]);

  for (const hit of hits) {
    const meta = hit.metadata || {};

    if (meta.name) names.add(meta.name.trim());
    if (meta.username) usernames.add(meta.username.trim());
    if (meta.avatarUrl) avatars.add(meta.avatarUrl.trim());
    if (meta.location) locations.add(meta.location.trim());
    if (meta.bio) bios.add(meta.bio.trim());
    if (meta.company) companies.add(meta.company.trim());

    if (meta.extra?.maskedPhone) maskedPhones.add(meta.extra.maskedPhone.trim());
    if (meta.extra?.maskedEmail) maskedEmails.add(meta.extra.maskedEmail.trim());

    if (meta.profileUrl) {
      externalLinks.push({ platform: hit.service, url: meta.profileUrl });
    }

    if (meta.extra?.verifiedAccounts && Array.isArray(meta.extra.verifiedAccounts)) {
      for (const va of meta.extra.verifiedAccounts) {
        if (va.url) externalLinks.push({ platform: va.service_name || 'Verified Link', url: va.url });
      }
    }

    // Classificação de confiança metodológica
    const isDirect = meta.extra?.verifiedByEmail === true || directEmailModules.has(hit.id);

    if (isDirect) {
      verifiedByEmail.push(hit);
    } else {
      verifiedByHandle.push(hit);
    }
  }

  return {
    targetEmail: email,
    names: Array.from(names),
    usernames: Array.from(usernames),
    avatars: Array.from(avatars),
    locations: Array.from(locations),
    bios: Array.from(bios),
    companies: Array.from(companies),
    maskedPhones: Array.from(maskedPhones),
    maskedEmails: Array.from(maskedEmails),
    externalLinks,
    verifiedByEmail,
    verifiedByHandle
  };
}

/**
 * Formata o Dossiê Unificado em Markdown para relatórios periciais.
 * @param {TargetDossier} dossier
 * @returns {string}
 */
export function formatDossierMarkdown(dossier) {
  let md = `# 🕵️ Dossiê Investigativo OSINT - ${dossier.targetEmail}\n\n`;
  md += `> Gerado automaticamente pela ferramenta **Diablinda** em ${new Date().toLocaleString('pt-BR')}.\n\n`;

  md += `## 👤 Identidade Consolidada\n`;
  md += `- **E-mail Alvo:** \`${dossier.targetEmail}\`\n`;
  md += `- **Nomes Detectados:** ${dossier.names.length > 0 ? dossier.names.map((n) => `**${n}**`).join(', ') : '_Nenhum nome público detectado_'}\n`;
  md += `- **@Usernames Associados:** ${dossier.usernames.length > 0 ? dossier.usernames.map((u) => `\`@${u}\``).join(', ') : '_Nenhum_'}\n`;
  md += `- **Localizações:** ${dossier.locations.length > 0 ? dossier.locations.join(' | ') : '_Não identificada_'}\n`;

  if (dossier.companies && dossier.companies.length > 0) {
    md += `- **Empresas / Organizações:** ${dossier.companies.join(', ')}\n`;
  }
  md += `\n`;

  if (dossier.maskedPhones?.length > 0 || dossier.maskedEmails?.length > 0) {
    md += `### 📱 Pistas de Contato & Recuperação Expostas\n`;
    if (dossier.maskedPhones?.length > 0) {
      md += `- **Telefones Vinculados:** ${dossier.maskedPhones.map((p) => `\`${p}\``).join(', ')}\n`;
    }
    if (dossier.maskedEmails?.length > 0) {
      md += `- **E-mails de Recuperação:** ${dossier.maskedEmails.map((e) => `\`${e}\``).join(', ')}\n`;
    }
    md += `\n`;
  }

  if (dossier.bios.length > 0) {
    md += `### 📝 Biografias & Apresentações Públicas\n`;
    for (const b of dossier.bios) {
      md += `> "${b}"\n\n`;
    }
  }

  if (dossier.avatars.length > 0) {
    md += `### 🖼️ Fotos de Perfil (Avatares HD)\n`;
    for (const av of dossier.avatars) {
      md += `- ![Avatar](${av}) [Visualizar Imagem HD](${av})\n`;
    }
    md += `\n`;
  }

  md += `## 🔒 Contas Confirmadas Diretamente por E-mail (Confiança Alta)\n`;
  if (dossier.verifiedByEmail.length > 0) {
    md += `| Plataforma | Categoria | Perfil / Dados | Duração |\n|---|---|---|---|\n`;
    for (const hit of dossier.verifiedByEmail) {
      const link = hit.metadata?.profileUrl ? `[Acessar Perfil](${hit.metadata.profileUrl})` : 'Conta Ativa';
      md += `| **${hit.service}** | \`${hit.category}\` | ${link} | ${hit.durationMs}ms |\n`;
    }
  } else {
    md += `_Nenhuma conta direta confirmada por e-mail._\n`;
  }
  md += `\n`;

  md += `## 🔍 Contas Associadas por Heurística de Handle (Confiança Média)\n`;
  if (dossier.verifiedByHandle.length > 0) {
    md += `| Plataforma | Handle | Link | Duração |\n|---|---|---|---|\n`;
    for (const hit of dossier.verifiedByHandle) {
      const handle = hit.metadata?.username ? `@${hit.metadata.username}` : '-';
      const link = hit.metadata?.profileUrl ? `[Visualizar](${hit.metadata.profileUrl})` : '-';
      md += `| **${hit.service}** | \`${handle}\` | ${link} | ${hit.durationMs}ms |\n`;
    }
  } else {
    md += `_Nenhuma conta vinculada por handle._\n`;
  }
  md += `\n`;

  if (dossier.externalLinks.length > 0) {
    md += `## 🌐 Links e Perfis Externos Cruzados\n`;
    for (const el of dossier.externalLinks) {
      md += `- **${el.platform}:** [${el.url}](${el.url})\n`;
    }
    md += `\n`;
  }

  return md;
}

