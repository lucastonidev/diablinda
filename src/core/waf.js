/**
 * @fileoverview Detector de WAF, Captchas e Bloqueios Anti-Bot reais.
 * Evita falsos positivos e falsos rate limits: só classifica como WAF
 * quando houver evidência real de desafio de bot (Cloudflare, Datadome, Captcha).
 */

const WAF_SIGNATURES = [
  'cf-mitigated',
  'just a moment...',
  'attention required! | cloudflare',
  'checking your browser before accessing',
  'enable javascript and cookies to continue',
  'challenge-platform',
  'datadome',
  'perimeterx',
  'px-captcha',
  'please verify you are a human',
  'security check to access',
  'access denied',
  'forbidden'
];

/**
 * Analisa se a resposta HTTP é um bloqueio WAF, Captcha ou Rate Limit real.
 * @param {Response|{ status: number, headers?: any }} res - Objeto fetch Response
 * @param {string} [bodyText=''] - Corpo da resposta em texto
 * @returns {boolean}
 */
export function isWafOrBlocked(res, bodyText = '') {
  // 429 é explicitamente Too Many Requests
  if (res.status === 429) {
    return true;
  }

  const lower = typeof bodyText === 'string' ? bodyText.toLowerCase() : '';

  // Procura assinaturas explícitas de desafio de bot no corpo
  for (const sig of WAF_SIGNATURES) {
    if (lower.includes(sig)) {
      return true;
    }
  }

  // Se retornou 403 ou 503 com conteúdo HTML da Cloudflare/WAF
  if (res.status === 403 || res.status === 503) {
    const isHtml = lower.includes('<html') || lower.includes('<!doctype') || lower.includes('<head');
    const isCloudflareHeader = res.headers?.get?.('server')?.toLowerCase()?.includes('cloudflare') || res.headers?.get?.('cf-ray');
    const isBlockMessage = lower.includes('forbidden') || lower.includes('access denied') || lower.includes('blocked');
    if (isHtml || isCloudflareHeader || isBlockMessage) {
      return true;
    }
  }

  return false;
}
